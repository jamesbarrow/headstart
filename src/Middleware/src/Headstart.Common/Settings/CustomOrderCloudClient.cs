using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using OrderCloud.SDK;

namespace Headstart.Common.Settings
{
    public interface IOrderCloudClientResolver
    {
        IOrderCloudClient Resolve(string marketplaceName);

        void Register(string marketplaceName, IOrderCloudClient client);
    }

    public class OrderCloudClientResolver : IOrderCloudClientResolver
    {
        public readonly IDictionary<string, IOrderCloudClient> _clients;

        public OrderCloudClientResolver()
        {
            _clients = new ConcurrentDictionary<string, IOrderCloudClient>();
        }

        public void Register(string marketplaceName, IOrderCloudClient client)
        {
            _clients.Add(marketplaceName, client);
        }

        public IOrderCloudClient Resolve(string marketplaceName)
        {
            return _clients.ContainsKey(marketplaceName) ? _clients[marketplaceName] : null;
        }
    }
}
