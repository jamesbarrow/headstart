import {inject, InjectionToken } from '@angular/core'
import { Router } from '@angular/router'
//import { environment } from '../../environments/environment.local'
import { environment } from '../../environments/environment.multimarketplace.local'
import { ApiRole } from 'ordercloud-javascript-sdk'
import { AppConfig } from '@app-seller/models/environment.types'
import { CookieService } from '../shared/services/cookie.service'

export const ocAppConfig: AppConfig = {
  appname: environment.appname,
  clientID: environment.clientID,
  marketplaceID: environment.marketplaceID,
  middlewareUrl: environment.middlewareUrl,
  orderCloudApiUrl: environment.orderCloudApiUrl,
  translateBlobUrl: environment.translateBlobUrl,
  supportedLanguages: environment.supportedLanguages,
  defaultLanguage: environment.defaultLanguage,
  blobStorageUrl: environment.blobStorageUrl,
  // marketplaceName is being hard-coded until this is available to store in OrderCloud
  marketplaceName: environment.marketplaceName,
  scope: [
    // 'AdminAddressReader' is just for reading admin addresses as a seller user on product create/edti
    // Will need to be updated to 'AdminAddressAdmin' when seller address create is implemented
    'ApiClientAdmin',
    'ApiClientReader',
    'AdminAddressAdmin',
    'AdminAddressReader',
    'MeAddressAdmin',
    'AddressReader',
    'MeAdmin',
    'BuyerUserAdmin',
    'UserGroupAdmin',
    'MeCreditCardAdmin',
    'MeXpAdmin',
    'Shopper',
    'CategoryReader',
    'ProductAdmin',

    // adding this for product editing and creation on the front end
    // this logic may be moved to the backend in the future and this might not be required
    'PriceScheduleAdmin',

    'SupplierReader',
    'SupplierAddressReader',
    'BuyerAdmin',
    'OverrideUnitPrice',
    'OrderAdmin',
    'OverrideTax',
    'OverrideShipping',
    'BuyerImpersonation',
    'AddressAdmin',
    'CategoryAdmin',
    'CatalogAdmin',
    'PromotionAdmin',
    'ApprovalRuleAdmin',
    'CreditCardAdmin',
    'SupplierAdmin',
    'SupplierUserAdmin',
    'SupplierUserGroupAdmin',
    'SupplierAddressAdmin',
    'AdminUserAdmin',
    'ProductFacetAdmin',
    'ProductFacetReader',
    'ShipmentAdmin',
    'UnsubmittedOrderReader',

    // custom cms roles
    'AssetAdmin',
    'DocumentAdmin',
    'SchemaAdmin',

    // custom roles used to conditionally display ui
    'HSMeProductAdmin',
    'HSMeProductReader',
    'HSProductAdmin',
    'HSProductReader',
    'HSPromotionAdmin',
    'HSPromotionReader',
    'HSCategoryAdmin',
    'HSCategoryReader',
    'HSOrderAdmin',
    'HSOrderReader',
    'HSShipmentAdmin',
    'HSBuyerAdmin',
    'HSBuyerReader',
    'HSSellerAdmin',
    'HSReportReader',
    'HSReportAdmin',
    'HSSupplierAdmin',
    'HSMeSupplierAdmin',
    'HSMeSupplierAddressAdmin',
    'HSMeSupplierUserAdmin',
    'HSSupplierUserGroupAdmin',
    'HSStorefrontAdmin',
  ] as ApiRole[],
  impersonatingBuyerScope: [
    'MeAddressAdmin',
    'AddressAdmin', // Only for location owners
    'MeAdmin',
    'MeCreditCardAdmin',
    'MeXpAdmin',
    'UserGroupAdmin',
    'ApprovalRuleAdmin',
    'BuyerUserAdmin',
    'Shopper',
    'BuyerReader',
    'PasswordReset',
    'SupplierReader',
    'SupplierAddressReader',
  ] as ApiRole[],
  impersonatingBuyerCustomRoleScope: [
    'HSLocationOrderApprover',
    'HSLocationViewAllOrders',
  ],
}

export const marketplaces: AppConfig[] = [];

environment.marketplaces.forEach(element => {
  let marketplace = (JSON.parse(JSON.stringify(ocAppConfig)));
  marketplace.clientID = element.clientID;
  marketplace.marketplaceID = element.marketplaceID;
  marketplace.marketplaceName = element.marketplaceName;
  marketplaces.push(marketplace);
});

//export class AppConfigResolver implements Resolve<AppConfig> {
  export class AppConfigResolver {
  constructor(private cookieService: CookieService) {
  }

  appConfigFactory(){

    let activeMarketplace = this.cookieService.getCookie('mk-test');

    console.log('app config cookie: '+activeMarketplace);

    if(activeMarketplace !== ''){
      var result = marketplaces.filter(obj => {
        //console.log('test: '+obj.marketplaceName);
        return obj.marketplaceName == activeMarketplace;
      })
      if(result && result[0]){
        console.log('loading cookie forced config: '+result[0].marketplaceName);
        return result[0];
      }
    }

    console.log('loading default config: '+ocAppConfig.marketplaceName);

    return ocAppConfig;
  }
}

export const applicationConfiguration = new InjectionToken<AppConfig>(
  'app.config',
  {
    providedIn: 'root',
    factory: () => { return new AppConfigResolver(inject(CookieService)).appConfigFactory() },
    //factory: () => { return ocAppConfig }
  }
)
