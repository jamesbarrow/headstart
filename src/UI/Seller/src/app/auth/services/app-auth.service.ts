import { Injectable, Inject } from '@angular/core'
import { Router } from '@angular/router'
import { applicationConfiguration } from '@app-seller/config/app.config'
import { AppConfig } from '@app-seller/models/environment.types'
import {
  OrderCloudUserType,
  SELLER,
  SUPPLIER,
} from '@app-seller/models/user.types'
import { AppStateService } from '@app-seller/shared/services/app-state/app-state.service'
import { CookieService } from 'ngx-cookie'
import * as jwtDecode from 'jwt-decode'
import { keys as _keys } from 'lodash'
import { LanguageSelectorService } from '@app-seller/shared'
import { DecodedToken, Tokens, Me, MeUser } from 'ordercloud-javascript-sdk'
@Injectable({
  providedIn: 'root',
})
export class AppAuthService {
  me: MeUser
  private rememberMeCookieName = `${this.appConfig.appname
    .replace(/ /g, '_')
    .toLowerCase()}_rememberMe`

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private appStateService: AppStateService,
    private languageService: LanguageSelectorService,
    @Inject(applicationConfiguration) private appConfig: AppConfig
  ) {}

  getDecodedToken(): DecodedToken {
    const userToken = Tokens.GetAccessToken()
    let decodedToken: DecodedToken
    try {
      decodedToken = jwtDecode(userToken) as DecodedToken
    } catch (e) {
      decodedToken = null
    }
    if (!decodedToken) {
      throw new Error('decoded jwt was null when attempting to get user roles')
    }
    return decodedToken
  }

  async getUserRoles(): Promise<string[]> {
    let roles = this.getRolesFromToken()

    console.log('roles', roles)
    let hsRoles = roles.filter((val) => {return val.startsWith('HS')})
    console.log('HS Roles', hsRoles)
    if(hsRoles.length == 0){
      let serverRoles = await this.getRolesFromMe()
      roles = roles.concat(serverRoles);
      /*this.getRolesFromMe().then((rolesValue) => {
        roles = rolesValue
        console.log('GETTING CLIENT ROLES', roles)
      })*/
      //roles = await this.getRolesFromMe()
    }
    console.log('GETTING CLIENT ROLES 2', roles)
    return roles
  }

  getOrdercloudUserType(): OrderCloudUserType {
    const usrtype = this.getUsrTypeFromToken()
    const OrdercloudUserType = usrtype === 'admin' ? SELLER : SUPPLIER
    return OrdercloudUserType
  }

  getRolesFromToken(): string[] {
    const decodedToken: DecodedToken = this.getDecodedToken()
    return typeof decodedToken.role === 'string'
      ? [decodedToken.role]
      : decodedToken.role
  }

  //multi marketplaces
  async getRolesFromMe(): Promise<string[]> {
    //we need to use the me call to the API.
    this.me = await Me.Get()

    return this.me.AvailableRoles
  }

  getUsrTypeFromToken(): string {
    const decodedToken: DecodedToken = this.getDecodedToken()
    return decodedToken.usrtype
  }

  //multimarketplace logout - logout but no redirect.
  baseLogout(): void {
    const cookiePrefix = this.appConfig.appname.replace(/ /g, '_').toLowerCase()
    const appCookieNames = _keys(this.cookieService.getAll())
    appCookieNames.forEach((cookieName) => {
      if (cookieName.includes(cookiePrefix)) {
        this.cookieService.remove(cookieName)
      }
    })
    this.appStateService.isLoggedIn.next(false)
    this.languageService.SetTranslateLanguage()
  }


  async logout(): Promise<void> {
    const cookiePrefix = this.appConfig.appname.replace(/ /g, '_').toLowerCase()
    const appCookieNames = _keys(this.cookieService.getAll())
    appCookieNames.forEach((cookieName) => {
      if (cookieName.includes(cookiePrefix)) {
        this.cookieService.remove(cookieName)
      }
    })
    this.appStateService.isLoggedIn.next(false)
    this.languageService.SetTranslateLanguage()
    await this.router.navigate(['/login'])
  }

  setRememberStatus(status: boolean): void {
    this.cookieService.putObject(this.rememberMeCookieName, { status })
  }

  getRememberStatus(): boolean {
    const rememberMe = <{ status: string }>(
      this.cookieService.getObject(this.rememberMeCookieName)
    )
    return !!(rememberMe && rememberMe.status)
  }
}
