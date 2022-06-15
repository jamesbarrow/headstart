﻿using System.Threading.Tasks;
using Headstart.Common.Settings;
using Microsoft.AspNetCore.Mvc;
using OrderCloud.Catalyst;
using OrderCloud.Integrations.EnvironmentSeed.Commands;
using OrderCloud.Integrations.EnvironmentSeed.Models;

namespace Headstart.API.Controllers
{
    public class EnvironmentSeedController : CatalystController
    {
        private readonly IEnvironmentSeedCommand command;
        private readonly AppSettings settings;

        public EnvironmentSeedController(
            IEnvironmentSeedCommand command,
            AppSettings settings)
        {
            this.command = command;
            this.settings = settings;
        }

        /// <summary>
        /// Seeds a brand new organization.
        /// </summary>
        /// <remarks>
        /// Check out the readme for more info https://github.com/ordercloud-api/headstart#seeding-ordercloud-data.
        /// </remarks>
        [HttpPost, Route("seed")]
        public async Task<EnvironmentSeedResponse> Seed([FromBody] EnvironmentSeedRequest seed)
        {
            return await command.Seed(seed);
        }

        /// <summary>
        /// Call this endpoint to update translation files from source
        /// useful if pulling in updates from repo and only want to update translation files
        /// assumes storage account connection string is in settings.
        /// </summary>
        [HttpPut, Route("updatetranslations")]
        public async Task UpdateTranslations()
        {
            await command.UpdateTranslations(
                settings.StorageAccountSettings.ConnectionString,
                settings.StorageAccountSettings.BlobContainerNameTranslations);
        }

        [HttpPost, Route("post-staging-restore"), OrderCloudWebhookAuth]
        public async Task PostStagingRestore()
        {
            if (settings.EnvironmentSettings.Environment == AppEnvironment.Production)
            {
                return;
            }

            await command.PostStagingRestore();
        }
    }
}
