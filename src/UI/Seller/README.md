## Multimarketplace solution - running in dev

1. open PowerShell - C:\Repositories\git\OrderCloud-Headstart\headstart
2. run docker compose up -d - this will start the storage and cosmos containers
3. Open Visual Studio - C:\Repositories\Git\OrderCloud-Headstart\headstart-jb\src\Middleware\Headstart.sln
4. Run/Debug the application - it will start on https://localhost:44373
5. Open Command Prompt - c:\sitecore\apps\ngrok
6. Run ngrok.exe http https://localhost:44373 --host-header "localhost:44373" - this will create an accessible address to the middleware used for SSO user creation/update.
7. Connect to OrderCloud.io
8. Update (for each marketplace) the Intergration event openidconnect.
9. Set the value to (marketplace speacific) the ngrok address + the endpoint (i.e. https://19ae-124-168-14-67.au.ngrok.io/mktp-MultiMarketplace2/openidconnect)
10. Open PowerShell - C:\Repositories\git\OrderCloud-Headstart\headstart\src\ui\Seller
11. Run npm run start - thsi will start the seller application

## Building the Seller App

### Install the Angular CLI

If you have not before - install the [Angular CLI](https://github.com/angular/angular-cli/wiki) globally on your machine with `npm install -g @angular/cli`

### Install and build the Headstart SDK

Both the buyer and the seller application rely on a shared SDK that lives in this codebase under src/UI/SDK. This SDK is used to interact with the middleware API. You'll need to install dependencies and build that project first.

1. Navigate to the SDK directory in src/UI/SDK
2. Install dependencies with `npm install`
3. Build the project with `npm run build`

### Install and build the Seller app

1. Navigate to the Seller directory in src/UI/Seller
2. Install dependencies with `npm install`
3. Fill out the [test app configuration](./src/assets/appConfigs/defaultadmin-test.json)
4. Run `npm run start` for a dev server. The app will automatically reload if you change any of the source files.

You can modify your local deployment by changing values in the [environment.local.ts](./src/environments/environment.local.ts) file to target a different seller or use the locally hosted middleware API

## Considerations

If your middleware API isn't yet hosted you will need to update the [environment.local.ts](./src/environments/environment.local.ts) to target the locally hosted middleware API. Set `useLocalMiddleware` to true and ensure `localMiddlewareURL` is the path your server is listening on.
