// ===== MAKE CHANGES TO CONFIGURATION BETWEEN THESE LINES ONLY =======
// ====================================================================
const brand = Brand.DEFAULT_ADMIN
const appEnvironment = Environment.TEST
const useLocalMiddleware = true
//const localMiddlewareURL = 'http://api.headstart.localhost'
const localMiddlewareURL = 'https://localhost:44373'
// ====================================================================
// ======= UNLESS YOU ARE DOING SOMETHING WEIRD =======================

import defaultadmintest from '../assets/appConfigs/defaultadmin-test.json'
import defaultadminstaging from '../assets/appConfigs/defaultadmin-staging.json'
import defaultadminproduction from '../assets/appConfigs/defaultadmin-production.json'

//import multi marketplace support
import multiMarketplace from '../assets/appConfigs/defaultadmin-marketplaces.json'

const apps = {
  TEST: {
    DEFAULT_ADMIN: defaultadmintest,
  },
  UAT: {
    DEFAULT_ADMIN: defaultadminstaging,
  },
  PRODUCTION: {
    DEFAULT_ADMIN: defaultadminproduction,
  },
}

//const allMarketplaces: MarketplaceConfig[] = multiMarketplace

// for easier debugging in development mode, ignores zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
import 'zone.js/plugins/zone-error'
import {
  Brand,
  Environment,
  EnvironmentConfig,
  MarketplaceConfig,
} from '@app-seller/models/environment.types'
const target: EnvironmentConfig = apps[appEnvironment][brand]
target.hostedApp = false
target.marketplaces = multiMarketplace as MarketplaceConfig[]
if (useLocalMiddleware) {
  target.middlewareUrl = localMiddlewareURL
}
export const environment = target
