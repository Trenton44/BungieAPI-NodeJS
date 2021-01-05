var Entities = {
   Applications: {
      ApplicationScopes: null,
      ApiUsage: null,
      Series: null,
      Datapoint: null,
      Application: null,
      ApplicationStatus: null,
      ApplicationDeveloper: null,
      DeveloperRole: null,
   },
   User: {
      UserMembership: null,
      CrossSaveUserMembership: null,
      UserInfoCard: null,
      GeneralUser: null,
      UserToUserContext: null,
      Models: {
         GetCredentialTypesForAccountResponse: null,
      },
      UserMembershipData: null,
      HardLinkedUserMembership: null,
      EmailSettings: null,
      EmailOptInDefinition: null,
      OptInFlags: null,
      EmailSubscriptionDefinition: null,
      EMailSettingLocalization: null,
      EMailSettingSubscriptionLocalization: null,
      EmailViewDefinition: null,
      EmailViewDefinitionSetting:null,
   },
   BungieMembershipType: null,
   Ignores: {
      IgnoreResponse: null,
      IgnoreStatus: null,
      IgnoreLength:null,
   },
   BungieCredentialType: null,
   Config: {
      UserTheme: null,
      GroupTheme:null,
   },
   GroupsV2: {
      GroupUserInfoCard: null,
      GroupResponse: null,
      GroupV2: null,
      GroupType: null,
      ChatSecuritySetting: null,
      GroupHomepage: null,
      MembershipOption: null,
      GroupPostPublicity: null,
      GroupFeatures: null,
      Capabilities: null,
      HostGuidedGamesPermissionLevel: null,
      RuntimeGroupMemberType: null,
      GroupV2ClanInfo: null,
      ClanBanner: null,
      GroupV2ClanInfoAndInvestment: null,
      GroupUserBase: null,
      GroupMember: null,
      GroupAllianceStatus: null,
      GroupPotentialMember: null,
      GroupPotentialMemberStatus: null,
      GroupDateRange: null,
      GroupV2Card: null,
      GroupSearchResponse: null,
      GroupQuery: null,
      GroupSortBy: null,
      GroupMemberCountFilter: null,
      GroupNameSearchRequest: null,
      GroupOptionalConversation: null,
      GroupEditAction: null,
      GroupOptionsEditAction: null,
      GroupOptionalConversationAddRequest: null,
      GroupOptionalConversationEditRequest: null,
      GroupMemberLeaveResult: null,
      GroupBanRequest: null,
      GroupBan: null,
      GroupMemberApplication: null,
      GroupApplicationResolveState: null,
      GroupApplicationRequest: null,
      GroupApplicationListRequest: null,
      GroupsForMemberFilter: null,
      GroupMembershipBase: null,
      GroupMembership: null,
      GroupMembershipSearchResponse: null,
      GetGroupsForMemberResponse: null,
      GroupPotentialMembership: null,
      GroupPotentialMembershipSearchResponse: null,
      GroupApplicationResponse:null,
   },
   Content: {
      Models: {
        ContentTypeDescription:null,
         ContentTypeProperty: null,
         ContentPropertyDataTypeEnum: null,
         ContentTypeDefaultValue: null,
         TagMetadataDefinition: null,
         TagMetadataItem: null,
         ContentPreview: null,
         ContentTypePropertySection: null,
      },
      ContentItemPublicContract: null,
      ContentRepresentation: null,
      CommentSummary: null,
   },
   Queries: {
      SearchResult: null,
      PagedQuery: null,
   },
   SearchResultOfContentItemPublicContract: null,
   Forum: {
      ForumTopicsCategoryFiltersEnum: null,
      ForumTopicsQuickDateEnum: null,
      ForumTopicsSortEnum: null,
      PostResponse: null,
      ForumMediaType: null,
      ForumPostPopularity: null,
      PostSearchResponse: null,
      PollResponse: null,
      PollResult: null,
      ForumRecruitmentDetail: null,
      ForumRecruitmentIntensityLabel: null,
      ForumRecruitmentToneLabel: null,
      ForumPostSortEnum: null,
      CommunityContentSortMode: null,
   },
   Forums: {
      ForumPostCategoryEnums: null,
      ForumFlagsEnum:null,
   },
   SearchResultOfPostResponse: null,
   BungieMembershipType: null,
   Destiny: {
      DestinyProgression: null,
      DestinyProgressionResetEntry: null,
      DestinyProgressionRewardItemState: null,
      Definitions: {
         DestinyDefinition: null,
         DestinyProgressionDefinition: null,
         Common: {
            DestinyDisplayPropertiesDefinition: null,
            DestinyIconSequenceDefinition: null,
            DestinyPositionDefinition: null,
         },
         DestinyProgressionDisplayPropertiesDefinition: null,
         DestinyProgressionStepDefinition: null,
         DestinyInventoryItemDefinition: null,
         DestinyItemTooltipNotification: null,
         DestinyItemActionBlockDefinition: null,
         DestinyItemActionRequiredItemDefinition: null,
         DestinyProgressionRewardDefinition: null,
         DestinyProgressionMappingDefinition: null,
         DestinyItemInventoryBlockDefinition: null,
         DestinyInventoryBucketDefinition: null,
         Items: {
            DestinyItemTierTypeDefinition: null,
            DestinyItemTierTypeInfusionBlock: null,
            DestinyDerivedItemCategoryDefinition: null,
            DestinyDerivedItemDefinition: null,
            DestinyItemPlugDefinition: null,
            DestinyPlugRuleDefinition: null,
            DestinyParentItemOverride: null,
            DestinyEnergyCapacityEntry: null,
            DestinyEnergyCostEntry:null,
         },
         DestinyItemSetBlockDefinition: null,
         DestinyItemSetBlockEntryDefinition: null,
         DestinyItemStatBlockDefinition: null,
         DestinyInventoryItemStatDefinition: null,
         DestinyStatDefinition: null,
         DestinyStatGroupDefinition: null,
         DestinyStatDisplayDefinition: null,
         DestinyStatOverrideDefinition: null,
         DestinyEquippingBlockDefinition: null,
         DestinyEquipmentSlotDefinition: null,
         DestinyArtDyeReference: null,
         DestinyItemTranslationBlockDefinition: null,
         DestinyGearArtArrangementReference: null,
         DestinyItemPreviewBlockDefinition: null,
         DestinyVendorDefinition: null,
         DestinyVendorDisplayPropertiesDefinition: null,
         DestinyVendorRequirementDisplayEntryDefinition: null,
         DestinyVendorActionDefinition: null,
         DestinyVendorCategoryEntryDefinition: null,
         DestinyVendorCategoryOverlayDefinition: null,
         DestinyDisplayCategoryDefinition: null,
         DestinyVendorInteractionDefinition: null,
         DestinyVendorInteractionReplyDefinition: null,
         DestinyVendorInteractionSackEntryDefinition: null,
         DestinyVendorInventoryFlyoutDefinition: null,
         DestinyVendorInventoryFlyoutBucketDefinition: null,
         DestinyVendorItemDefinition: null,
         DestinyVendorItemQuantity: null,
         DestinyItemCreationEntryLevelDefinition: null,
         DestinyVendorSaleItemActionBlockDefinition: null,
         DestinyVendorItemSocketOverride: null,
         Sockets: {
            DestinySocketTypeDefinition: null,
            DestinyInsertPlugActionDefinition: null,
            DestinyPlugWhitelistEntryDefinition: null,
            DestinySocketTypeScalarMaterialRequirementEntry: null,
            DestinySocketCategoryDefinition: null,
            DestinyPlugSetDefinition:null,
         },
         DestinyVendorServiceDefinition: null,
         DestinyVendorAcceptedItemDefinition: null,
         Vendors: {
            DestinyVendorLocationDefinition:null,
         },
         DestinyDestinationDefinition: null,
         DestinyActivityGraphListEntryDefinition: null,
         Director: {
            DestinyActivityGraphDefinition: null,
            DestinyActivityGraphNodeDefinition: null,
            DestinyActivityGraphNodeFeaturingStateDefinition: null,
            DestinyActivityGraphNodeActivityDefinition: null,
            DestinyActivityGraphNodeStateEntry: null,
            DestinyActivityGraphArtElementDefinition: null,
            DestinyActivityGraphConnectionDefinition: null,
            DestinyActivityGraphDisplayObjectiveDefinition: null,
            DestinyActivityGraphDisplayProgressionDefinition: null,
            DestinyLinkedGraphDefinition: null,
            DestinyLinkedGraphEntryDefinition:null,
         },
         DestinyActivityDefinition: null,
         DestinyActivityRewardDefinition: null,
         DestinyActivityModifierReferenceDefinition: null,
         ActivityModifiers: {
            DestinyActivityModifierDefinition:null,
         },
         DestinyActivityChallengeDefinition: null,
         DestinyObjectiveDefinition: null,
         DestinyObjectivePerkEntryDefinition: null,
         DestinySandboxPerkDefinition: null,
         DestinyTalentNodeStepGroups: null,
         DestinyTalentNodeStepWeaponPerformances: null,
         DestinyTalentNodeStepImpactEffects: null,
         DestinyTalentNodeStepGuardianAttributes: null,
         DestinyTalentNodeStepLightAbilities: null,
         DestinyTalentNodeStepDamageTypes: null,
         DestinyObjectiveStatEntryDefinition: null,
         DestinyItemInvestmentStatDefinition: null,
         DestinyLocationDefinition: null,
         DestinyLocationReleaseDefinition: null,
         DestinyActivityUnlockStringDefinition: null,
         DestinyActivityPlaylistItemDefinition: null,
         DestinyActivityModeDefinition: null,
         DestinyActivityMatchmakingBlockDefinition: null,
         DestinyActivityGuidedBlockDefinition: null,
         DestinyActivityLoadoutRequirementSet: null,
         DestinyActivityLoadoutRequirement: null,
         DestinyActivityInsertionPointDefinition: null,
         DestinyPlaceDefinition: null,
         DestinyActivityTypeDefinition: null,
         DestinyUnlockExpressionDefinition: null,
         DestinyDestinationBubbleSettingDefinition: null,
         DestinyBubbleDefinition: null,
         DestinyVendorGroupReference: null,
         DestinyVendorGroupDefinition: null,
         DestinyFactionDefinition: null,
         DestinyFactionVendorDefinition: null,
         Artifacts: {
            DestinyArtifactDefinition: null,
            DestinyArtifactTierDefinition: null,
            DestinyArtifactTierItemDefinition:null,
         },
         DestinyItemQualityBlockDefinition: null,
         DestinyItemVersionDefinition: null,
         PowerCaps: {
            DestinyPowerCapDefinition:null,
         },
         Progression: {
            DestinyProgressionLevelRequirementDefinition:null,
         },
         DestinyItemValueBlockDefinition: null,
         DestinyItemSourceBlockDefinition: null,
         Sources: {
            DestinyItemSourceDefinition:null,
         },
         DestinyRewardSourceDefinition: null,
         DestinyRewardSourceCategory: null,
         DestinyItemVendorSourceReference: null,
         DestinyItemObjectiveBlockDefinition: null,
         DestinyObjectiveDisplayProperties: null,
         DestinyItemMetricBlockDefinition: null,
         Presentation: {
            DestinyPresentationNodeBaseDefinition: null,
            DestinyScoredPresentationNodeBaseDefinition: null,
            DestinyPresentationNodeDefinition: null,
            DestinyPresentationNodeChildrenBlock: null,
            DestinyPresentationNodeChildEntry: null,
            DestinyPresentationNodeCollectibleChildEntry: null,
            DestinyPresentationNodeRequirementsBlock: null,
            DestinyPresentationChildBlock: null,
            DestinyPresentationNodeRecordChildEntry: null,
            DestinyPresentationNodeMetricChildEntry:null,
         },
         Traits: {
            DestinyTraitDefinition: null,
            DestinyTraitCategoryDefinition:null,
         },
         Collectibles: {
            DestinyCollectibleDefinition: null,
            DestinyCollectibleAcquisitionBlock: null,
            DestinyCollectibleStateBlock:null,
         },
         DestinyMaterialRequirementSetDefinition: null,
         DestinyMaterialRequirement: null,
         DestinyUnlockValueDefinition: null,
         Records: {
            DestinyRecordDefinition: null,
            DestinyRecordTitleBlock: null,
            DestinyRecordCompletionBlock: null,
            SchemaRecordStateBlock: null,
            DestinyRecordExpirationBlock: null,
            DestinyRecordIntervalBlock: null,
            DestinyRecordIntervalObjective:null,
         },
         DestinyGenderDefinition: null,
         Lore: {
            DestinyLoreDefinition:null,
         },
         Metrics: {
            DestinyMetricDefinition:null,
         },
         EnergyTypes: {
            DestinyEnergyTypeDefinition:null,
         },
         DestinyItemGearsetBlockDefinition: null,
         DestinyItemSackBlockDefinition: null,
         DestinyItemSocketBlockDefinition: null,
         DestinyItemSocketEntryDefinition: null,
         DestinyItemSocketEntryPlugItemDefinition: null,
         DestinyItemSocketEntryPlugItemRandomizedDefinition: null,
         DestinyItemIntrinsicSocketEntryDefinition: null,
         DestinyItemSocketCategoryDefinition: null,
         DestinyItemSummaryBlockDefinition: null,
         DestinyItemTalentGridBlockDefinition: null,
         DestinyTalentGridDefinition: null,
         DestinyTalentNodeDefinition: null,
         DestinyNodeActivationRequirement: null,
         DestinyNodeStepDefinition: null,
         DestinyNodeSocketReplaceResponse: null,
         DestinyDamageTypeDefinition: null,
         DestinyTalentNodeExclusiveSetDefinition: null,
         DestinyTalentExclusiveGroup: null,
         DestinyTalentNodeCategory: null,
         DestinyItemPerkEntryDefinition: null,
         Animations: {
            DestinyAnimationReference:null,
         },
         DestinyItemCategoryDefinition: null,
         BreakerTypes: {
            DestinyBreakerTypeDefinition:null,
         },
         Seasons: {
            DestinySeasonDefinition: null,
            DestinySeasonPassDefinition:null,
         },
         DestinyProgressionRewardItemQuantity: null,
         Checklists: {
            DestinyChecklistDefinition: null,
            DestinyChecklistEntryDefinition:null,
         },
         DestinyRaceDefinition: null,
         DestinyClassDefinition: null,
         Milestones: {
            DestinyMilestoneDefinition: null,
            DestinyMilestoneDisplayPreference: null,
            DestinyMilestoneType: null,
            DestinyMilestoneQuestDefinition: null,
            DestinyMilestoneQuestRewardsDefinition: null,
            DestinyMilestoneQuestRewardItem: null,
            DestinyMilestoneActivityDefinition: null,
            DestinyMilestoneActivityVariantDefinition: null,
            DestinyMilestoneRewardCategoryDefinition: null,
            DestinyMilestoneRewardEntryDefinition: null,
            DestinyMilestoneVendorDefinition: null,
            DestinyMilestoneValueDefinition: null,
            DestinyMilestoneChallengeActivityDefinition: null,
            DestinyMilestoneChallengeDefinition: null,
            DestinyMilestoneChallengeActivityGraphNodeEntry: null,
            DestinyMilestoneChallengeActivityPhase:null,
         },
         DestinyUnlockDefinition: null,
         Reporting: {
            DestinyReportReasonCategoryDefinition: null,
            DestinyReportReasonDefinition:null,
         },
         DestinyEntitySearchResult: null,
         DestinyEntitySearchResultItem:null,
      },
      DestinyProgressionScope: null,
      DestinyProgressionStepDisplayEffect: null,
      DestinyItemQuantity: null,
      Misc: {
         DestinyColor:null,
      },
      TierType: null,
      BucketScope: null,
      BucketCategory: null,
      ItemLocation: null,
      DestinyStatAggregationType: null,
      DestinyStatCategory: null,
      EquippingItemBlockAttributes: null,
      DestinyAmmunitionType: null,
      DyeReference: null,
      VendorDisplayCategorySortOrder: null,
      DestinyVendorInteractionRewardSelection: null,
      DestinyVendorReplyType: null,
      VendorInteractionType: null,
      DestinyItemSortType: null,
      DestinyVendorItemRefundPolicy: null,
      DestinyGatingScope: null,
      SocketTypeActionType: null,
      DestinySocketVisibility: null,
      DestinySocketCategoryStyle: null,
      ActivityGraphNodeHighlightType: null,
      DestinyUnlockValueUIStyle: null,
      DestinyObjectiveGrantStyle: null,
      DamageType: null,
      DestinyActivityNavPointType: null,
      HistoricalStats: {
         Definitions: {
            DestinyActivityModeType: null,
            DestinyHistoricalStatsDefinition: null,
            DestinyStatsGroupType: null,
            PeriodType: null,
            DestinyActivityModeType: null,
            DestinyStatsCategoryType: null,
            UnitType: null,
            DestinyStatsMergeMethod: null,
            PeriodType:null,
         },
         DestinyPostGameCarnageReportData: null,
         DestinyHistoricalStatsActivity: null,
         DestinyPostGameCarnageReportEntry: null,
         DestinyHistoricalStatsValue: null,
         DestinyHistoricalStatsValuePair: null,
         DestinyPlayer: null,
         DestinyPostGameCarnageReportExtendedData: null,
         DestinyHistoricalWeaponStats: null,
         DestinyPostGameCarnageReportTeamEntry: null,
         DestinyLeaderboard: null,
         DestinyLeaderboardEntry: null,
         DestinyLeaderboardResults: null,
         DestinyClanAggregateStat: null,
         DestinyHistoricalStatsByPeriod: null,
         DestinyHistoricalStatsPeriodGroup: null,
         DestinyHistoricalStatsResults: null,
         DestinyHistoricalStatsAccountResult: null,
         DestinyHistoricalStatsWithMerged: null,
         DestinyHistoricalStatsPerCharacter: null,
         DestinyActivityHistoryResults: null,
         DestinyHistoricalWeaponStatsData: null,
         DestinyAggregateActivityResults: null,
         DestinyAggregateActivityStats:null,
      },
      DestinyActivityModeCategory: null,
      DestinyItemSubType: null,
      Constants: {
         DestinyEnvironmentLocationMapping:null,
      },
      DestinyGraphNodeState: null,
      DestinyPresentationNodeType: null,
      DestinyScope: null,
      DestinyPresentationDisplayStyle: null,
      DestinyRecordValueStyle: null,
      DestinyGender: null,
      DestinyRecordToastStyle: null,
      DestinyPresentationScreenStyle: null,
      PlugUiStyles: null,
      PlugAvailabilityMode: null,
      DestinyEnergyType: null,
      SocketPlugSources: null,
      ItemPerkVisibility: null,
      SpecialItemType: null,
      DestinyItemType: null,
      DestinyClass: null,
      DestinyBreakerType: null,
      DestinyProgressionRewardItemAcquisitionBehavior: null,
      Config: {
         DestinyManifest: null,
         GearAssetDataBaseDefinition: null,
         ImagePyramidEntry:null,
      },
      Responses: {
         DestinyLinkedProfilesResponse: null,
         DestinyProfileUserInfoCard: null,
         DestinyErrorProfile: null,
         get DestinyProfileResponse(){
           return new function(){
             return {
               vendorReceipts: Entities.SingleComponentResponseOfDestinyVendorReceiptsComponent,
               profileInventory: Entities.SingleComponentResponseOfDestinyInventoryComponent,
               profileCurrencies: Entities.SingleComponentResponseOfDestinyInventoryComponent,
               profile: Entities.SingleComponentResponseOfDestinyProfileComponent,
               platformSilver: Entities.SingleComponentResponseOfDestinyPlatformSilverComponent,
               profileKiosks: Entities.SingleComponentResponseOfDestinyKiosksComponent,
               profilePlugSets: Entities.SingleComponentResponseOfDestinyPlugSetsComponent,
               profileProgression: Entities.SingleComponentResponseOfDestinyProfileProgressionComponent,
               profilePresentationNodes: Entities.SingleComponentResponseOfDestinyPresentationNodesComponent,
               profileRecords: Entities.SingleComponentResponseOfDestinyProfileRecordsComponent,
               profileCollectibles: Entities.SingleComponentResponseOfDestinyProfileCollectiblesComponent,
               profileTransitoryData: Entities.SingleComponentResponseOfDestinyProfileTransitoryComponent,
               metrics: Entities.SingleComponentResponseOfDestinyMetricsComponent,
               characters: Entities.DictionaryComponentResponseOfint64AndDestinyCharacterComponent,
               characterInventories: Entities.DictionaryComponentResponseOfint64AndDestinyInventoryComponent,
               characterProgressions: Entities.DictionaryComponentResponseOfint64AndDestinyCharacterProgressionComponent,
               characterRenderData: Entities.DictionaryComponentResponseOfint64AndDestinyCharacterRenderComponent,
               characterActivities: Entities.DictionaryComponentResponseOfint64AndDestinyCharacterActivitiesComponent,
               characterEquipment: Entities.DictionaryComponentResponseOfint64AndDestinyInventoryComponent,
               characterKiosks: Entities.DictionaryComponentResponseOfint64AndDestinyKiosksComponent,
               characterPlugSets: Entities.DictionaryComponentResponseOfint64AndDestinyPlugSetsComponent,
               characterUninstancedItemComponents: Entities.DestinyBaseItemComponentSetOfuint32,
               characterPresentationNodes: Entities.DictionaryComponentResponseOfint64AndDestinyPresentationNodesComponent,
               characterRecords: Entities.DictionaryComponentResponseOfint64AndDestinyCharacterRecordsComponent,
               characterCollectibles: Entities.DictionaryComponentResponseOfint64AndDestinyCollectiblesComponent,
               itemComponents: Entities.DestinyItemComponentSetOfint64,
               characterCurrencyLookups: Entities.DictionaryComponentResponseOfint64AndDestinyCurrenciesComponent,
             };
           };
         },
         DestinyCharacterResponse: null,
         DestinyItemResponse: null,
         DestinyVendorsResponse: null,
         PersonalDestinyVendorSaleItemSetComponent: null,
         DestinyVendorResponse: null,
         DestinyPublicVendorsResponse: null,
         PublicDestinyVendorSaleItemSetComponent: null,
         DestinyCollectibleNodeDetailResponse: null,
         InventoryChangedResponse: null,
         DestinyItemChangeResponse:null,
      },
      Components: {
         Inventory: {
            DestinyPlatformSilverComponent: null,
            DestinyCurrenciesComponent:null,
         },
         Kiosks: {
            DestinyKiosksComponent: null,
            DestinyKioskItem:null,
         },
         PlugSets: {
            DestinyPlugSetsComponent:null,
         },
         Profiles: {
            DestinyProfileProgressionComponent: null,
            DestinyProfileTransitoryComponent: null,
            DestinyProfileTransitoryPartyMember: null,
            DestinyProfileTransitoryCurrentActivity: null,
            DestinyProfileTransitoryJoinability: null,
            DestinyProfileTransitoryTrackingEntry:null,
         },
         Presentation: {
            DestinyPresentationNodesComponent: null,
            DestinyPresentationNodeComponent:null,
         },
         Records: {
            DestinyRecordsComponent: null,
            DestinyRecordComponent: null,
            DestinyProfileRecordsComponent: null,
            DestinyCharacterRecordsComponent:null,
         },
         Collectibles: {
            DestinyCollectiblesComponent: null,
            DestinyCollectibleComponent: null,
            DestinyProfileCollectiblesComponent:null,
         },
         Metrics: {
            DestinyMetricsComponent: null,
            DestinyMetricComponent:null,
         },
         Items: {
            DestinyItemReusablePlugsComponent: null,
            DestinyItemPlugObjectivesComponent: null,
            DestinyItemPlugComponent:null,
         },
         Vendors: {
            DestinyVendorGroupComponent: null,
            DestinyVendorGroup: null,
            DestinyVendorBaseComponent: null,
            DestinyVendorSaleItemBaseComponent: null,
            DestinyPublicVendorComponent: null,
            DestinyPublicVendorSaleItemComponent:null,
         }
      },
      Entities: {
         Items: {
            DestinyItemComponent: null,
            DestinyItemObjectivesComponent: null,
            DestinyItemInstanceComponent: null,
            DestinyItemInstanceEnergy: null,
            DestinyItemPerksComponent: null,
            DestinyItemRenderComponent: null,
            DestinyItemStatsComponent: null,
            DestinyItemSocketsComponent: null,
            DestinyItemSocketState: null,
            DestinyItemTalentGridComponent:null,
         },
         Profiles: {
           get DestinyVendorReceiptsComponent(){
             return new function(){
               return {
                 receipts:Entities.DestinyVendorReceipt,
               };
             };
           },
            DestinyProfileComponent:null,
         },
         Inventory: {
            DestinyInventoryComponent:null,
         },
         Characters: {
            DestinyCharacterComponent: null,
            DestinyCharacterProgressionComponent: null,
            DestinyCharacterRenderComponent: null,
            DestinyCharacterActivitiesComponent:null,
         },
         Vendors: {
            DestinyVendorComponent: null,
            DestinyVendorCategoriesComponent: null,
            DestinyVendorCategory: null,
            DestinyVendorSaleItemComponent:null,
         }
      },
      ItemBindStatus: null,
      TransferStatuses: null,
      ItemState: null,
      Quests: {
         DestinyObjectiveProgress: null,
         DestinyQuestStatus:null,
      },
      DestinyGameVersions: null,
      DestinyComponentType: {
        platform: {
          profiles: 100,
          vendorreceipts: 101,
          profileinventories: 102,
          profilecurrency: 103,
          profileprogression: 104,
          platformsilver: 105
        },
        characters: {
          characters: 200,
          characterinventory: 201,
          characterprogression: 202,
          characterrenderdata: 203,
          characteractivity: 204,
          characterequipment: 205
        },
        items:{
          iteminstances: 300,
          itemobjectives: 301,
          itemperks: 302,
          itemrenderdata: 303,
          itemstats: 304,
          itemsockets: 305,
        },
        vendors:{
          vendors: 400,
          vendorcategory: 401,
          vendorsales: 402,
          kiosks: 500,
          currencylookup: 600
        },
        stats:{
          records: 900,
          metrics: 1100
        }
      },
      Vendors: {
         get DestinyVendorReceipt(){
           return new function(){
             return {
               currencyPaid: Entities.DestinyItemQuantity,
               itemReceived: Entities.DestinyItemQuantity,
               licenseUnlockHash: null,
               purchasedByCharacterId: null,
               refundPolicy: null,
               sequenceNumber: null,
               timeToExpiration: null,
               expiresOn: null,
             };
           };
         },
      },
      Sockets: {
         DestinyItemPlugBase: null,
         DestinyItemPlug:null,
      },
      Artifacts: {
         DestinyArtifactProfileScoped: null,
         DestinyArtifactCharacterScoped: null,
         DestinyArtifactTier: null,
         DestinyArtifactTierItem:null,
      },
      DestinyPresentationNodeState: null,
      DestinyRecordState: null,
      DestinyCollectibleState: null,
      DestinyPartyMemberStates: null,
      DestinyGamePrivacySetting: null,
      DestinyJoinClosedReasons: null,
      DestinyRace: null,
      Progression: {
         DestinyFactionProgression:null,
      },
      Milestones: {
         DestinyMilestone: null,
         DestinyMilestoneQuest: null,
         DestinyMilestoneActivity: null,
         DestinyMilestoneActivityVariant: null,
         DestinyMilestoneActivityCompletionStatus: null,
         DestinyMilestoneActivityPhase: null,
         DestinyMilestoneChallengeActivity: null,
         DestinyMilestoneVendor: null,
         DestinyMilestoneRewardCategory: null,
         DestinyMilestoneRewardEntry: null,
         DestinyMilestoneContent: null,
         DestinyMilestoneContentItemCategory: null,
         DestinyPublicMilestone: null,
         DestinyPublicMilestoneQuest: null,
         DestinyPublicMilestoneActivity: null,
         DestinyPublicMilestoneActivityVariant: null,
         DestinyPublicMilestoneChallenge: null,
         DestinyPublicMilestoneChallengeActivity: null,
         DestinyPublicMilestoneVendor:null,
      },
      Challenges: {
         DestinyChallengeStatus:null,
      },
      Character: {
         DestinyCharacterCustomization: null,
         DestinyCharacterPeerView: null,
         DestinyItemPeerView:null,
      },
      DestinyActivity: null,
      DestinyActivityDifficultyTier: null,
      DestinyStat: null,
      EquipFailureReason: null,
      Perks: {
         DestinyPerkReference:null,
      },
      DestinyTalentNode: null,
      DestinyTalentNodeState: null,
      DestinyTalentNodeStatBlock: null,
      DestinyVendorFilter: null,
      VendorItemStatus: null,
      DestinyUnlockStatus: null,
      DestinyVendorItemState: null,
      Requests: {
         Actions: {
            DestinyActionRequest: null,
            DestinyCharacterActionRequest: null,
            DestinyItemActionRequest: null,
            DestinyPostmasterTransferRequest: null,
            DestinyItemSetActionRequest: null,
            DestinyItemStateRequest: null,
            DestinyInsertPlugsActionRequest: null,
            DestinyInsertPlugsRequestEntry: null,
            DestinySocketArrayType:null,
         },
         DestinyItemTransferRequest:null,
      },
      DestinyEquipItemResults: null,
      DestinyEquipItemResult: null,
      Reporting: {
         Requests: {
            DestinyReportOffensePgcrRequest:null,
         }
      },
      Advanced: {
         AwaInitializeResponse: null,
         AwaPermissionRequested: null,
         AwaType: null,
         AwaUserResponse: null,
         AwaUserSelection: null,
         AwaAuthorizationResult: null,
         AwaResponseReason:null,
      },
      Activities: {
         DestinyPublicActivityStatus:null,
      }
   },
   Interpolation: {
      InterpolationPoint: null,
      InterpolationPointFloat:null,
   },
   Dates: {
      DateRange:null,
   },
   Links: {
      HyperlinkReference:null,
   },
   Tags: {
      Models: {
         Contracts: {
            TagResponse:null,
         }
      }
   },
   SearchResultOfGroupV2Card: null,
   SearchResultOfGroupMember: null,
   SearchResultOfGroupBan: null,
   SearchResultOfGroupMemberApplication: null,
   Entities: {
      EntityActionResult:null,
   },
   Exceptions: {
      PlatformErrorCodes:null,
   },
   SearchResultOfGroupMembership: null,
   SearchResultOfGroupPotentialMembership: null,
   Tokens: {
      PartnerOfferClaimRequest: null,
      PartnerOfferSkuHistoryResponse: null,
      PartnerOfferHistoryResponse:null,
   },
   Components: {
      ComponentResponse: null,
      ComponentPrivacySetting:null,
   },
   get SingleComponentResponseOfDestinyVendorReceiptsComponent(){
     return new function(){
       return {
         data: Entities.Destiny.Entities.Profiles.DestinyVendorReceiptsComponent,
         privacy: null,
         disabled: null,
       };
     };
   },
   SingleComponentResponseOfDestinyInventoryComponent: null,
   SingleComponentResponseOfDestinyProfileComponent: null,
   SingleComponentResponseOfDestinyPlatformSilverComponent: null,
   SingleComponentResponseOfDestinyKiosksComponent: null,
   SingleComponentResponseOfDestinyPlugSetsComponent: null,
   SingleComponentResponseOfDestinyProfileProgressionComponent: null,
   SingleComponentResponseOfDestinyPresentationNodesComponent: null,
   SingleComponentResponseOfDestinyProfileRecordsComponent: null,
   SingleComponentResponseOfDestinyProfileCollectiblesComponent: null,
   SingleComponentResponseOfDestinyProfileTransitoryComponent: null,
   SingleComponentResponseOfDestinyMetricsComponent: null,
   DictionaryComponentResponseOfint64AndDestinyCharacterComponent: null,
   DictionaryComponentResponseOfint64AndDestinyInventoryComponent: null,
   DictionaryComponentResponseOfint64AndDestinyCharacterProgressionComponent: null,
   DictionaryComponentResponseOfint64AndDestinyCharacterRenderComponent: null,
   DictionaryComponentResponseOfint64AndDestinyCharacterActivitiesComponent: null,
   DictionaryComponentResponseOfint64AndDestinyKiosksComponent: null,
   DictionaryComponentResponseOfint64AndDestinyPlugSetsComponent: null,
   DestinyBaseItemComponentSetOfuint32: null,
   DictionaryComponentResponseOfuint32AndDestinyItemObjectivesComponent: null,
   DictionaryComponentResponseOfint64AndDestinyPresentationNodesComponent: null,
   DictionaryComponentResponseOfint64AndDestinyCharacterRecordsComponent: null,
   DictionaryComponentResponseOfint64AndDestinyCollectiblesComponent: null,
   DestinyBaseItemComponentSetOfint64: null,
   DictionaryComponentResponseOfint64AndDestinyItemObjectivesComponent: null,
   DestinyItemComponentSetOfint64: null,
   DictionaryComponentResponseOfint64AndDestinyItemInstanceComponent: null,
   DictionaryComponentResponseOfint64AndDestinyItemPerksComponent: null,
   DictionaryComponentResponseOfint64AndDestinyItemRenderComponent: null,
   DictionaryComponentResponseOfint64AndDestinyItemStatsComponent: null,
   DictionaryComponentResponseOfint64AndDestinyItemSocketsComponent: null,
   DictionaryComponentResponseOfint64AndDestinyItemReusablePlugsComponent: null,
   DictionaryComponentResponseOfint64AndDestinyItemPlugObjectivesComponent: null,
   DictionaryComponentResponseOfint64AndDestinyItemTalentGridComponent: null,
   DictionaryComponentResponseOfuint32AndDestinyItemPlugComponent: null,
   DictionaryComponentResponseOfint64AndDestinyCurrenciesComponent: null,
   SingleComponentResponseOfDestinyCharacterComponent: null,
   SingleComponentResponseOfDestinyCharacterProgressionComponent: null,
   SingleComponentResponseOfDestinyCharacterRenderComponent: null,
   SingleComponentResponseOfDestinyCharacterActivitiesComponent: null,
   SingleComponentResponseOfDestinyCharacterRecordsComponent: null,
   SingleComponentResponseOfDestinyCollectiblesComponent: null,
   SingleComponentResponseOfDestinyCurrenciesComponent: null,
   SingleComponentResponseOfDestinyItemComponent: null,
   SingleComponentResponseOfDestinyItemInstanceComponent: null,
   SingleComponentResponseOfDestinyItemObjectivesComponent: null,
   SingleComponentResponseOfDestinyItemPerksComponent: null,
   SingleComponentResponseOfDestinyItemRenderComponent: null,
   SingleComponentResponseOfDestinyItemStatsComponent: null,
   SingleComponentResponseOfDestinyItemTalentGridComponent: null,
   SingleComponentResponseOfDestinyItemSocketsComponent: null,
   SingleComponentResponseOfDestinyItemReusablePlugsComponent: null,
   SingleComponentResponseOfDestinyItemPlugObjectivesComponent: null,
   SingleComponentResponseOfDestinyVendorGroupComponent: null,
   DictionaryComponentResponseOfuint32AndDestinyVendorComponent: null,
   DictionaryComponentResponseOfuint32AndDestinyVendorCategoriesComponent: null,
   DestinyVendorSaleItemSetComponentOfDestinyVendorSaleItemComponent: null,
   DictionaryComponentResponseOfuint32AndPersonalDestinyVendorSaleItemSetComponent: null,
   DestinyBaseItemComponentSetOfint32: null,
   DictionaryComponentResponseOfint32AndDestinyItemObjectivesComponent: null,
   DestinyItemComponentSetOfint32: null,
   DictionaryComponentResponseOfint32AndDestinyItemInstanceComponent: null,
   DictionaryComponentResponseOfint32AndDestinyItemPerksComponent: null,
   DictionaryComponentResponseOfint32AndDestinyItemRenderComponent: null,
   DictionaryComponentResponseOfint32AndDestinyItemStatsComponent: null,
   DictionaryComponentResponseOfint32AndDestinyItemSocketsComponent: null,
   DictionaryComponentResponseOfint32AndDestinyItemReusablePlugsComponent: null,
   DictionaryComponentResponseOfint32AndDestinyItemPlugObjectivesComponent: null,
   DictionaryComponentResponseOfint32AndDestinyItemTalentGridComponent: null,
   SingleComponentResponseOfDestinyVendorComponent: null,
   SingleComponentResponseOfDestinyVendorCategoriesComponent: null,
   DictionaryComponentResponseOfint32AndDestinyVendorSaleItemComponent: null,
   DictionaryComponentResponseOfuint32AndDestinyPublicVendorComponent: null,
   DestinyVendorSaleItemSetComponentOfDestinyPublicVendorSaleItemComponent: null,
   DictionaryComponentResponseOfuint32AndPublicDestinyVendorSaleItemSetComponent: null,
   DestinyItemComponentSetOfuint32: null,
   DictionaryComponentResponseOfuint32AndDestinyItemInstanceComponent: null,
   DictionaryComponentResponseOfuint32AndDestinyItemPerksComponent: null,
   DictionaryComponentResponseOfuint32AndDestinyItemRenderComponent: null,
   DictionaryComponentResponseOfuint32AndDestinyItemStatsComponent: null,
   DictionaryComponentResponseOfuint32AndDestinyItemSocketsComponent: null,
   DictionaryComponentResponseOfuint32AndDestinyItemReusablePlugsComponent: null,
   DictionaryComponentResponseOfuint32AndDestinyItemPlugObjectivesComponent: null,
   DictionaryComponentResponseOfuint32AndDestinyItemTalentGridComponent: null,
   SearchResultOfDestinyEntitySearchResultItem: null,
   Trending: {
      TrendingCategories: null,
      TrendingCategory: null,
      TrendingEntry: null,
      TrendingEntryType: null,
      TrendingDetail: null,
      TrendingEntryNews: null,
      TrendingEntrySupportArticle: null,
      TrendingEntryDestinyItem: null,
      TrendingEntryDestinyActivity: null,
      TrendingEntryDestinyRitual: null,
      TrendingEntryCommunityCreation:null,
   },
   SearchResultOfTrendingEntry: null,
   Fireteam: {
      FireteamDateRange: null,
      FireteamPlatform: null,
      FireteamPublicSearchOption: null,
      FireteamSlotSearch: null,
      FireteamSummary: null,
      FireteamResponse: null,
      FireteamMember: null,
      FireteamUserInfoCard: null,
      FireteamPlatformInviteResult:null,
   },
   SearchResultOfFireteamSummary: null,
   SearchResultOfFireteamResponse: null,
   Common: {
      Models: {
        CoreSettingsConfiguration:null,
         CoreSystem: null,
         CoreSetting: null,
         Destiny2CoreSettings:null,
      },
   },
   GlobalAlert: null,
   GlobalAlertLevel: null,
   GlobalAlertType: null,
   StreamInfo:null,
}
exports.Entities = Entities
