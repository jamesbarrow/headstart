using System.Threading.Tasks;
using Headstart.API.Commands;
using Headstart.Common.Models;
using Microsoft.AspNetCore.Mvc;
using OrderCloud.Catalyst;
using OrderCloud.Integrations.Emails;
using OrderCloud.SDK;

namespace Headstart.Common.Controllers
{
    //[Route("user")]
    public class UserController : CatalystController
    {
        private readonly IOrderCloudClient oc;
        private readonly IOpenIdConnectCommand _openIdConnectCommand;

        public UserController(IOpenIdConnectCommand openIdConnectCommand, IOrderCloudClient oc)
        {
            this.oc = oc;
            _openIdConnectCommand = openIdConnectCommand;
        }

        [HttpPost, Route("mktp-{marketplace}/openidconnect/createuser")] // route and method specified by OrderCloud platform
        //[OrderCloudWebhookAuth] // Security feature to verifiy request came from Ordercloud.
        public async Task<OpenIdConnectCreateUserResponse> CreateUserFromSSOAsync([FromBody] OpenIDConnectIEPayload payload) =>
            await _openIdConnectCommand.CreateUserFromSSOAsync(payload);

        [HttpPost, Route("mktp-{marketplace}/openidconnect/syncuser")] // route and method specified by OrderCloud platform
        //[OrderCloudWebhookAuth] // Security feature to verifiy request came from Ordercloud.
        public async Task<OpenIdConnectSyncUserResponse> UpdateUserFromSSOAsync([FromBody] OpenIDConnectIEPayload payload) =>
            await _openIdConnectCommand.UpdateUserFromSSOAsync(payload);
    }
}

