import { Injectable, Inject } from '@angular/core'
import { Supplier, Me, Auth, Tokens, MeUser } from 'ordercloud-javascript-sdk'
import { applicationConfiguration, marketplaces } from '@app-seller/config/app.config'
import { AppAuthService } from '@app-seller/auth/services/app-auth.service'
import { AppStateService } from '../app-state/app-state.service'
import { HeadStartSDK, HSSupplier, ImageAsset } from '@ordercloud/headstart-sdk'
import { BehaviorSubject } from 'rxjs'
import { AppConfig } from '@app-seller/models/environment.types'
import { UserContext } from '@app-seller/models/user.types'
import { LanguageSelectorService } from '@app-seller/shared'
import { CookieService } from '../cookie.service'

@Injectable({
  providedIn: 'root',
})
export class CurrentUserService {
  me: MeUser
  mySupplier: Supplier
  public userSubject: BehaviorSubject<MeUser> = new BehaviorSubject<MeUser>({})
  public profileImgSubject: BehaviorSubject<ImageAsset> =
    new BehaviorSubject<ImageAsset>({})
  constructor(
    @Inject(applicationConfiguration) private appConfig: AppConfig,
    private languageService: LanguageSelectorService,
    private appAuthService: AppAuthService,
    private appStateService: AppStateService,
    private cookieService: CookieService
  ) {}
  
  async login(
    username: string,
    password: string,
    rememberMe: boolean
  ): Promise<void> {

    console.log('current marketplace: '+this.appConfig.marketplaceName);
    console.log('current client id: '+this.appConfig.clientID);

    const accessToken = await Auth.Login(
      username,
      password,
      this.appConfig.clientID,
      this.appConfig.scope
    )

    if (rememberMe && accessToken.refresh_token) {
      /**
       * set the token duration in the dashboard - https://developer.ordercloud.io/dashboard/settings
       * refresh tokens are configured per clientID and initially set to 0
       * a refresh token of 0 means no refresh token is returned in OAuth accessToken
       */
      Tokens.SetRefreshToken(accessToken.refresh_token)
      this.appAuthService.setRememberStatus(true)
    }
    //Tokens.SetAccessToken(accessToken.access_token)
    Tokens.SetAccessToken(accessToken.access_token)
    this.appStateService.isLoggedIn.next(true)
    this.me = await Me.Get()
    this.userSubject.next(this.me)
    await this.languageService.SetTranslateLanguage()
    if (this.me?.Supplier) {
      this.mySupplier = await HeadStartSDK.Suppliers.GetMySupplier(
        this.me?.Supplier?.ID
      )
    }
  }

  async ssologin(
    token: string
  ): Promise<void> {

    console.log('current marketplace: '+this.appConfig.marketplaceName);
    console.log('current client id: '+this.appConfig.clientID);
    
    console.log('set access token: '+token);
    //Tokens.SetAccessToken(accessToken.access_token)
    Tokens.SetAccessToken(token)
    this.appStateService.isLoggedIn.next(true)
    this.me = await Me.Get()
    this.userSubject.next(this.me)
    await this.languageService.SetTranslateLanguage()
    if (this.me?.Supplier) {
      this.mySupplier = await HeadStartSDK.Suppliers.GetMySupplier(
        this.me?.Supplier?.ID
      )
    }
  }

  async changeMarketplace(marketplace: string): Promise<void>{
    let activeMarketplace = this.cookieService.getCookie('mk-test');

    if(activeMarketplace.length === 0 || activeMarketplace != marketplace){
      this.cookieService.setCookie({ name: 'mk-test', value: marketplace });
    }
  }

  async getSSORedirect(marketplace: string): Promise<string>{
    let url = "https://australiaeast-sandbox.ordercloud.io/ocrplogin?id=B2CTest&roles=FullAccess ApiClientAdmin AdminAddressAdmin AdminAddressReader AddressReader MeAdmin BuyerUserAdmin UserGroupAdmin MeXpAdmin ProductAdmin PriceScheduleAdmin SupplierReader SupplierAddressReader BuyerAdmin OrderAdmin BuyerImpersonation AddressAdmin CategoryAdmin CatalogAdmin PromotionAdmin ApprovalRuleAdmin CreditCardAdmin SupplierAdmin SupplierUserAdmin SupplierUserGroupAdmin SupplierAddressAdmin AdminUserAdmin ProductFacetAdmin ProductFacetReader ShipmentAdmin"

    const marketplaceConfig = marketplaces.filter((mkpl) => {
      return mkpl.marketplaceName == marketplace;
    });

    if(marketplaceConfig.length > 0){
      console.log('redirecting the user to SSO login', (url + '&cid=' + marketplaceConfig[0].apiClientID))
      return (url + '&cid=' + marketplaceConfig[0].apiClientID)
    }

    return "";
    //error - we should have one
    //&cid=B82C37EC-DC2A-4552-BA68-AB3D5B12FDC7

  }

  async getUser(): Promise<MeUser> {
    return this.me ? this.me : await this.refreshUser()
  }

  async patchUser(patchObj: Partial<MeUser>): Promise<MeUser> {
    const patchedUser = await Me.Patch(patchObj)
    this.userSubject.next(patchedUser)
    this.me = patchedUser
    return this.me
  }

  async refreshUser(): Promise<MeUser> {
    this.me = await Me.Get()
    this.userSubject.next(this.me)
    return this.me
  }

  async getMySupplier(): Promise<HSSupplier> {
    const me = await this.getUser()
    if (!me.Supplier) return
    return this.mySupplier && this.mySupplier.ID === me.Supplier.ID
      ? this.mySupplier
      : await this.refreshSupplier(me.Supplier.ID)
  }

  async refreshSupplier(supplierID: string): Promise<HSSupplier> {
    const token = Tokens.GetAccessToken()
    this.mySupplier = await HeadStartSDK.Suppliers.GetMySupplier(
      supplierID,
      token
    )
    return this.mySupplier
  }

  async getUserContext(): Promise<UserContext> {
    const UserContext: UserContext = await this.constructUserContext()
    return UserContext
  }

  async constructUserContext(): Promise<UserContext> {
    const me: MeUser = await this.getUser()
    const userType = this.appAuthService.getOrdercloudUserType()
    const userRoles = await this.appAuthService.getUserRoles()
    return {
      Me: me,
      UserType: userType,
      UserRoles: userRoles,
    }
  }

  async isSupplierUser(): Promise<boolean> {
    const me = await this.getUser()
    return Boolean(me.Supplier)
  }

  onChange(callback: (user: MeUser) => void): void {
    this.userSubject.subscribe(callback)
  }

  private get user(): MeUser {
    return this.userSubject.value
  }

  private set user(value: MeUser) {
    this.userSubject.next(value)
  }
}
