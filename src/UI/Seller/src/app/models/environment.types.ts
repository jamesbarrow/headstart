import { ApiRole } from 'ordercloud-javascript-sdk'

export interface MarketplaceConfig {
  marketplaceID: string
  marketplaceName: string
  clientID: string
  apiClientID: string
}

export interface EnvironmentConfig {
  hostedApp: boolean
  marketplaces?: MarketplaceConfig[]
  marketplaceID: string
  marketplaceName: string
  clientID: string
  middlewareUrl: string
  appname: string
  translateBlobUrl: string
  supportedLanguages: string[]
  defaultLanguage: string
  blobStorageUrl: string
  orderCloudApiUrl: string
}

export interface BuyerConfig {
  clientID: string
  buyerUrl: string
}

export enum Brand {
  'DEFAULT_ADMIN' = 'DEFAULT_ADMIN',
}

export enum Environment {
  'TEST' = 'TEST',
  'UAT' = 'UAT',
  'PRODUCTION' = 'PRODUCTION',
}

export interface AppConfig {
  /**
   * A short name for your app. It will be used as a
   * cookie prefix as well as general display throughout the app.
   */
  appname: string

  /**
   * The identifier for the seller, buyer network or buyer application that
   * will be used for authentication. You can view client ids for apps
   * you own or are a contributor to on the [dashboard](https://developer.ordercloud.io/dashboard)
   */
  marketplaceID: string
  clientID: string

  /*SSO Support - used for login URL*/
  apiClientID: string
  /**
   * base path to middleware
   */
  middlewareUrl: string
  /**
  * Optional base url to provide for OrderCloud CMS management. Note: this is a deprecated feature
  */
  translateBlobUrl: string
  supportedLanguages: string[]
  defaultLanguage: string
  blobStorageUrl: string

  // marketplaceName is being hard-coded until this is available to store in OrderCloud
  marketplaceName: string

  /**
   * An array of security roles that will be requested upon login.
   * These roles allow access to specific endpoints in the OrderCloud.io API.
   * To learn more about these roles and the security profiles that comprise them
   * read [here](https://developer.ordercloud.io/documentation/platform-guides/authentication/security-profiles)
   */

  orderCloudApiUrl: string

  scope: ApiRole[]
  impersonatingBuyerScope: ApiRole[]
  impersonatingBuyerCustomRoleScope: string[]
}
