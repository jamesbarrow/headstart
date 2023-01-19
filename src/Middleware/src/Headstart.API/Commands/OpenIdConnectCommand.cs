using Headstart.Common.Models;
using OrderCloud.SDK;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace Headstart.API.Commands
{
    public interface IOpenIdConnectCommand
    {
        Task<OpenIdConnectCreateUserResponse> CreateUserFromSSOAsync(OpenIDConnectIEPayload payload);
        Task<OpenIdConnectSyncUserResponse> UpdateUserFromSSOAsync(OpenIDConnectIEPayload payload);
    }

    public class OpenIdConnectCommand : IOpenIdConnectCommand
    {
        private readonly IOrderCloudClient _oc;

        public OpenIdConnectCommand(IOrderCloudClient oc)
        {
            _oc = oc;
        }

        public async Task<OpenIdConnectCreateUserResponse> CreateUserFromSSOAsync(OpenIDConnectIEPayload payload)
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(payload.TokenResponse.id_token);
            var tokenS = jsonToken as JwtSecurityToken;
            // Get User details from external identity providing system and create user in OrderCloud.
            var email = tokenS.Claims.Where(x => "emails" == x.Type).Select(x => x.Value).FirstOrDefault();
            var firstname = tokenS.Claims.Where(x => "given_name" == x.Type).Select(x => x.Value).FirstOrDefault();
            var lastname = tokenS.Claims.Where(x => "family_name" == x.Type).Select(x => x.Value).FirstOrDefault();
            var name = tokenS.Claims.Where(x => "name" == x.Type).Select(x => x.Value).FirstOrDefault();
            var user = await _oc.AdminUsers.CreateAsync(new User()
            {
                Active = true,
                Email = email,
                FirstName = firstname,
                LastName = lastname,
                Username = name
            });

            return new OpenIdConnectCreateUserResponse()
            {
                Username = user.Username,
                ErrorMessage = ""
            };
        }

        public async Task<OpenIdConnectSyncUserResponse> UpdateUserFromSSOAsync(OpenIDConnectIEPayload payload)
        {
            // Get User details from external identity providing system and patch user in OrderCloud if necesary.
            //not implemented

            return new OpenIdConnectSyncUserResponse();
        }


        //[HttpPost, Route("createuser")]
        //public async Task<CreateUserEventResponse> CreateUser([FromBody] CommonModels model)
        //{
        //    //oc.Tokens.SetAccessToken(body.OrderCloudAccessToken);

        //    var user = await oc.AdminUsers.CreateAsync(new User()
        //    {
        //        Active = true,
        //        Email = "test@test.com",
        //        FirstName = "Testing",
        //        LastName = "test",
        //        Username = "test"
        //    });



        //    return new CreateUserEventResponse()
        //    {
        //        Username = user.Username,
        //        ErrorMessage = ""
        //    };
        //}
    }
}
