using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Headstart.Common.Commands;
using Headstart.Common.Services;
using Headstart.Common.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using OrderCloud.SDK;

namespace Headstart.Common.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection Inject(this IServiceCollection services, Type service)
        {
            return services.AddServicesByConvention(service.Assembly, service.Namespace);
        }

        public static IServiceCollection Inject<T>(this IServiceCollection services)
        {
            return services.AddServicesByConvention(typeof(T).Assembly, typeof(T).Namespace);
        }

        public static IServiceCollection AddServicesByConvention(this IServiceCollection services, Assembly asm, string @namespace = null)
        {
            var mappings =
                from impl in asm.GetTypes()
                let iface = impl.GetInterface($"I{impl.Name}")
                where iface != null
                where @namespace == null || iface.Namespace == @namespace
                select new { iface, impl };

            foreach (var m in mappings)
            {
                //don't override specific registration
                if (!services.Any(x => x.ServiceType == m.iface))
                {
                    services.AddSingleton(m.iface, m.impl);
                }
            }

            return services;
        }

        public static IServiceCollection InjectOrderCloudToResolver<T>(this IServiceCollection services, List<OrderCloudSettings> orderCloudSettings)
        {
            //we don't need a resolver with one instance registered
            //if (orderCloudSettings.Count == 1)
            //{
            //    services.AddSingleton<IOrderCloudClient>(provider => new OrderCloudClient(new OrderCloudClientConfig
            //    {
            //        ApiUrl = orderCloudSettings[0].ApiUrl,
            //        AuthUrl = orderCloudSettings[0].ApiUrl,
            //        ClientId = orderCloudSettings[0].MiddlewareClientID,
            //        ClientSecret = orderCloudSettings[0].MiddlewareClientSecret,
            //        Roles = new[] { ApiRole.FullAccess },
            //    }));
            //    return services;
            //}

            var clientResolver = new OrderCloudClientResolver();
            foreach (var orderCloudSetting in orderCloudSettings)
            {
                clientResolver.Register(orderCloudSetting.MarketplaceName, new OrderCloudClient(new OrderCloudClientConfig
                {
                    ApiUrl = orderCloudSetting.ApiUrl,
                    AuthUrl = orderCloudSetting.ApiUrl,
                    ClientId = orderCloudSetting.MiddlewareClientID,
                    ClientSecret = orderCloudSetting.MiddlewareClientSecret,
                    Roles = new[] { ApiRole.FullAccess },
                }));
            }

            // Configure OrderCloud
            services.AddSingleton<IOrderCloudClientResolver>(clientResolver);

            services.AddTransient<IOrderCloudClient>(provider =>
            {
                var orderCloudClientResolver = provider.GetService(typeof(IOrderCloudClientResolver)) as IOrderCloudClientResolver;
                if (orderCloudClientResolver == null)
                    throw new Exception("The Order Cloud Client Resolver has can not be found in the service dependencies");

                var request = provider.GetService<IHttpContextAccessor>()?.HttpContext?.Request;
                string currentContextMarketplace = string.Empty;
                if (request != null)
                {
                    if (request.Method == "POST" && request.Path.Value.Contains("mktp-"))
                    {
                        var url = request.Path.Value.Split('/');
                        var identifier = url.FirstOrDefault(x => x.StartsWith("mktp-"));
                        if (!string.IsNullOrEmpty(identifier))
                        {
                            currentContextMarketplace = identifier.Substring("mktp-".Length);
                        }
                    }


                    if (string.IsNullOrEmpty(currentContextMarketplace))
                        currentContextMarketplace = provider.GetService<IHttpContextAccessor>()?.HttpContext?.Request?.Headers["marketplacename"];
                }

                //get the marketplace name
                //var currentContextMarketplace = provider.GetService<IHttpContextAccessor>()?.HttpContext?.Request?.Headers["marketplacename"];

                if (string.IsNullOrEmpty(currentContextMarketplace))
                    //throw new Exception("No marketplace found in the Http Header");
                    return orderCloudClientResolver.Resolve("MultiMarketplace1");
                //temporary as we can't send this info yet.

                return orderCloudClientResolver.Resolve(currentContextMarketplace);
            });

            return services;
        }

        public static IServiceCollection InjectOrderCloud<T>(this IServiceCollection services, OrderCloudSettings orderCloudSettings)
        {
            services.AddSingleton<IOrderCloudClient>(provider => new OrderCloudClient(new OrderCloudClientConfig
            {
                ApiUrl = orderCloudSettings.ApiUrl,
                AuthUrl = orderCloudSettings.ApiUrl,
                ClientId = orderCloudSettings.MiddlewareClientID,
                ClientSecret = orderCloudSettings.MiddlewareClientSecret,
                Roles = new[] { ApiRole.FullAccess },
            }));

            return services;
        }

        public static IServiceCollection InjectOrderCloud<T>(this IServiceCollection services, OrderCloudClientConfig config)
        {
            services.AddSingleton<IOrderCloudClient>(provider => new OrderCloudClient(config));
            return services;
        }

        public static IServiceCollection AddMockShippingProvider(this IServiceCollection services)
        {
            services.TryAddSingleton<IShippingCommand, MockShippingCommand>();
            services.TryAddSingleton<IShippingService, DefaultShippingService>();

            return services;
        }

        public static IServiceCollection AddMockTaxProvider(this IServiceCollection services)
        {
            services.TryAddTransient<ITaxCodesProvider, MockTaxService>();
            services.TryAddTransient<ITaxCalculator, MockTaxService>();

            return services;
        }

        public static IServiceCollection AddMockCreditCardProcessor(this IServiceCollection services)
        {
            services.TryAddSingleton<ICreditCardProcessor, MockCreditCardProcessor>();

            return services;
        }

        public static IServiceCollection AddDefaultAddressProvider(this IServiceCollection services)
        {
            services.TryAddSingleton<IAddressCommand, AddressCommand>();
            services.TryAddSingleton<IAddressValidationCommand, AddressValidationCommand>();

            return services;
        }

        public static IServiceCollection AddDefaultOMSProvider(this IServiceCollection services)
        {
            services.TryAddSingleton<IOMSService, DefaultOMSService>();

            return services;
        }
    }
}
