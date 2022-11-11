import { Component, OnInit, Inject } from '@angular/core'
import { applicationConfiguration } from '@app-seller/config/app.config'
import {
  faBoxOpen,
  faSignOutAlt,
  faUser,
  faUsers,
  faMapMarkerAlt,
  faSitemap,
  faUserCircle,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons'
import { MeUser, Tokens } from 'ordercloud-javascript-sdk'
import { Router, NavigationEnd } from '@angular/router'
import { AppConfig, AppStateService, HSRoute } from '@app-seller/shared'
import { getHeaderConfig } from './header.config'
import { AppAuthService } from '@app-seller/auth/services/app-auth.service'
import { CurrentUserService } from '@app-seller/shared/services/current-user/current-user.service'
import { TranslateService } from '@ngx-translate/core'
import { LanguageSelectorService } from '@app-seller/shared'
import { CookieService } from '@app-seller/shared/services/cookie.service'
import { marketplaces } from '@app-seller/config/app.config'

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
/*
@Component({
  selector: 'Layout-header',
  templateUrl: './sidebars/sidebars.component.html',
  styleUrls: ['./sidebars/sidebars.component.css'],
})*/
export class HeaderComponent implements OnInit {
  user: MeUser
  organizationName: string
  isSupplierUser: boolean
  isCollapsed = true
  faBoxOpen = faBoxOpen
  faUser = faUser
  faSignOutAlt = faSignOutAlt
  faUsers = faUsers
  faMapMarker = faMapMarkerAlt
  faSitemap = faSitemap
  faUserCircle = faUserCircle
  faEnvelope = faEnvelope
  activeTitle = ''
  headerConfig: HSRoute[]
  hasProfileImg = false
  currentUserInitials: string
  selectedLanguage: string
  languages: string[]
  selectedMarketplace: string
  marketplaceOptions: string[]

  constructor(
    private router: Router,
    private appStateService: AppStateService,
    private appAuthService: AppAuthService,
    private currentUserService: CurrentUserService,
    private translate: TranslateService,
    private languageService: LanguageSelectorService,
    private cookieService: CookieService,
    @Inject(applicationConfiguration) protected appConfig: AppConfig
  ) {
    this.setUpSubs()
  }

  async ngOnInit(): Promise<void> {
    this.headerConfig = getHeaderConfig(
      this.appAuthService.getUserRoles(),
      this.appAuthService.getOrdercloudUserType()
    )
    await this.getCurrentUser()
    this.setCurrentUserInitials(this.user)
    this.urlChange(this.router.url)
    this.languages = this.translate.getLangs()
    this.selectedLanguage = this.translate.currentLang
    this.translate.onLangChange.subscribe((event) => {
      this.selectedLanguage = event.lang
    })

    this.marketplaceOptions = marketplaces.map((mkp) => mkp.marketplaceName);
    //marketplace
    let selectedMkPlace = this.cookieService.getCookie('mk-test')
    if(selectedMkPlace !== ''){
      this.selectedMarketplace = selectedMkPlace
    }
    else{
      this.selectedMarketplace = this.appConfig.marketplaceName
    }
  }

  async getCurrentUser(): Promise<void> {
    this.isSupplierUser = await this.currentUserService.isSupplierUser()
    if (this.isSupplierUser) {
      this.getSupplierOrg()
    } else {
      this.organizationName = this.appConfig.marketplaceName
    }
  }

  async getSupplierOrg(): Promise<void> {
    const mySupplier = await this.currentUserService.getMySupplier()
    this.organizationName = mySupplier.Name
  }

  setUpSubs(): void {
    this.currentUserService.userSubject.subscribe((user) => {
      this.user = user
      this.setCurrentUserInitials(this.user)
    })
    this.currentUserService.profileImgSubject.subscribe((img) => {
      this.hasProfileImg = Object.keys(img).length > 0
    })
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.urlChange(ev.url)
      }
    })
  }

  urlChange = (url: string): void => {
    const activeNavGroup = this.headerConfig.find((grouping) => {
      return (
        (url.includes(grouping.route) && grouping.subRoutes) ||
        grouping.route === url
      )
    })
    this.activeTitle = activeNavGroup && activeNavGroup.title
  }

  logout(): void {
    Tokens.RemoveAccessToken();
    this.appStateService.isLoggedIn.next(false)
    this.router.navigate(['/login'])
  }

  toAccount(): void {
    this.router.navigate(['account'])
  }

  async setMarketplace(marketplace: string): Promise<void> {
    //set cookie
    this.cookieService.setCookie({ name: 'mk-test', value: marketplace })
    window.location = window.location;
  }

  async setLanguage(language: string): Promise<void> {
    const user = await this.currentUserService.refreshUser()
    await this.languageService.SetLanguage(language, user)
  }

  toNotifications(): void {
    this.router.navigate(['account/notifications'])
  }

  setCurrentUserInitials(user: MeUser): void {
    const firstFirst = user?.FirstName?.substr(0, 1)
    const firstLast = user?.LastName?.substr(0, 1)
    this.currentUserInitials = `${firstFirst}${firstLast}`
  }
}
