json -I -f /usr/share/nginx/html/assets/appConfigs/defaultadmin-test.json \
      -e "this.marketplaceID='$MARKETPLACE_ID'" \
      -e "this.clientID='$SELLER_CLIENT_ID'" \
      -e "this.orderCloudApiUrl='$ORDERCLOUD_API_URL'" \
      -e "this.middlewareUrl='$MIDDLEWARE_URL'" \
      -e "this.translateBlobUrl='$TRANSLATE_BLOB_URL'" \
      -e "this.blobStorageUrl='$BLOB_STORAGE_URL'" \
      -e "this.supportedLanguages=$SUPPORTED_LANGUAGES" \
      -e "this.defaultLanguage='$DEFAULT_LANGUAGE'"

cd /usr/share/nginx/html
node inject-appconfig defaultadmin-test
cd -

nginx -g 'daemon off;'