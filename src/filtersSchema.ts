 // Facet Constants (User-Facing Titles)
 export const APPROVED = 'Approved in WDS';
 export const ASSET_CATEGORY = 'Asset Category';
 export const ASSET_ROOM_TYPE = 'Asset Room Type';
 export const BRAND_CATALOG = 'Brand Catalog';
 export const CREATIVE_BRIEF_ID = 'Creative Brief ID';
 export const DATE_IMPORTED = 'Date Imported';
 export const EXCLUSIVE_BRAND = 'Exclusive Brand';
 export const FILE_TYPE = 'File Type';
 export const HOLIDAY = 'Holiday';
 export const IMAGE_HEIGHT = 'Image Height';
 export const IMAGE_MEDIA_FORMAT = 'Image Media Format';
 export const IMAGE_TYPE = 'Image Type';
 export const IMAGE_WIDTH = 'Image Width';
 export const LEGACY_PRODUCT_CLASS = 'Legacy Product Class';
 export const LIFE_STAGE = 'Life Stage';
 export const MANUFACTURER_PART_ID = 'Manufacturer Part ID';
 export const MARKETING_CHANNEL = 'Marketing Channel';
 export const MODELER = 'Modeler';
 export const MODELING_PROCESS = 'Modeling Process';
 export const MODEL_DEPTH = 'Model Depth';
 export const MODEL_HEIGHT = 'Model Height';
 export const MODEL_PART_CATEGORY = 'Model Part Category';
 export const MODEL_TIER = 'Model Tier';
 export const MODEL_TYPE = 'Model Type';
 export const MODEL_WIDTH = 'Model Width';
 export const ORIGINAL_CREATION_DATE = 'Date Updated';
 export const PERMISSION_GROUP = 'Permission Group';
 export const PRIMARY_COLOR = 'Primary Color';
 export const PRODUCT_CLASS = 'Product Class';
 export const PRODUCT_IMAGE_TYPE = 'Product Image Type';
 export const PRODUCT_STATUS = 'Live On Site';
 export const PROP_CATEGORY = 'Prop Category';
 export const REGION = 'Region';
 export const REQUESTING_BRAND = 'Requesting Brand';
 export const REQUESTING_PROGRAM = 'Requesting Program';
 export const ROOM_SETTING = 'Room Setting';
 export const SEASON = 'Season';
 export const SECONDARY_COLOR = 'Secondary Color';
 export const SKU = 'SKU';
 export const SOURCE_CATEGORY = 'Source Category';
 export const STYLE = 'Style';
 export const SUBSTYLE = 'Substyle';
 export const SUB_MODEL_PART_CATEGORY = 'Sub Model Part Category';
 export const SUB_PRODUCT_IMAGE_TYPE = 'Sub Product Image Type';
 export const SUB_SOURCE_CATEGORY = 'Sub Source Category';
 
 // Additional Non-Filter Fields
 export const FIELD_ASSET_ID = 'AssetID';
 export const FIELD_ASSET_LEVEL_MTDOID = 'asset_level_mtdoid';
 export const FIELD_DATE_TIME_IMPORTED = 'DateTimeImported';
 export const FIELD_DESCRIPTION = 'Description';
 export const FIELD_DOCUMENT_RESOURCE_ID = 'DocumentResourceID';
 export const FIELD_ENTRY_TYPE = 'EntryType';
 export const FIELD_IMAGE_ID = 'ImageID';
 export const FIELD_METADATA_ID = 'metadata_id';
 export const FIELD_NAME = 'Name';
 export const FIELD_PREVIEW_IRE_ID = 'PreviewIreID';
 export const FIELD_PRIMARY_COLOR = 'PrimaryColor';
 export const FIELD_SEARCHABLE_DATE = 'SearchableDate';
 export const FIELD_VIDEO_RESOURCE_ID = 'VideoResourceID';
 export const FIELD_MPID_DISPLAYSKU = 'MPID_DisplaySku';
 export const FIELD_MANUFACTURER_PARTID = 'ManufacturerPartID';
 export const FIELD_CREATIVE_BRIEF_ID = 'CreativeBriefID';
 
 // User-Facing Facet List, in Rank Order
 export const SIDEBAR_FACETS = [
   ASSET_CATEGORY,
   BRAND_CATALOG,
   EXCLUSIVE_BRAND,
   STYLE,
   SUBSTYLE,
   APPROVED,
   MODEL_TIER,
   MODEL_HEIGHT,
   MODEL_WIDTH,
   MODEL_DEPTH,
   MODEL_PART_CATEGORY,
   SUB_MODEL_PART_CATEGORY,
   PROP_CATEGORY,
   PRODUCT_CLASS,
   IMAGE_TYPE,
   PRODUCT_IMAGE_TYPE,
   SUB_PRODUCT_IMAGE_TYPE,
   PRODUCT_STATUS,
   PRIMARY_COLOR,
   REQUESTING_BRAND,
   REGION,
   LIFE_STAGE,
   IMAGE_MEDIA_FORMAT,
   SOURCE_CATEGORY,
   SUB_SOURCE_CATEGORY,
   MARKETING_CHANNEL,
   REQUESTING_PROGRAM,
   ASSET_ROOM_TYPE,
   HOLIDAY,
   SEASON,
   DATE_IMPORTED,
   ORIGINAL_CREATION_DATE,
   ROOM_SETTING,
   SECONDARY_COLOR,
   MODEL_TYPE,
   MODELING_PROCESS,
   MODELER,
   PERMISSION_GROUP,
   FILE_TYPE,
   IMAGE_HEIGHT,
   IMAGE_WIDTH,
   LEGACY_PRODUCT_CLASS,
 ];
 
 // Ordered/Ranked Facet Object
 export const FACET_ORDERING = (() => {
   const asObject = {};
   SIDEBAR_FACETS.forEach((facet, index) => (asObject[facet] = index));
   return asObject;
 })();
 
 // Mapping of User-Facing Titles to Solr Fields
 export const FACET_FIELDS = {
   [APPROVED]: 'Approved',
   [ASSET_CATEGORY]: 'AssetCategory',
   [ASSET_ROOM_TYPE]: 'AssetRoomType',
   [BRAND_CATALOG]: 'BrandCatalog',
   [CREATIVE_BRIEF_ID]: 'CreativeBriefID',
   [DATE_IMPORTED]: 'DateTimeImported',
   [EXCLUSIVE_BRAND]: 'ExclusiveBrand',
   [FILE_TYPE]: 'FileExtension',
   [HOLIDAY]: 'Holiday',
   [IMAGE_HEIGHT]: 'ImageHeight',
   [IMAGE_MEDIA_FORMAT]: 'ImageMediaFormat',
   [IMAGE_TYPE]: 'ImageType',
   [IMAGE_WIDTH]: 'ImageWidth',
   [LEGACY_PRODUCT_CLASS]: 'ProductClass',
   [LIFE_STAGE]: 'LifeStage',
   [MANUFACTURER_PART_ID]: 'ManufacturerPartID',
   [MARKETING_CHANNEL]: 'MarketingChannel',
   [MODELER]: 'Modeler',
   [MODELING_PROCESS]: 'ModelingProcess',
   [MODEL_DEPTH]: 'ModelDepth',
   [MODEL_HEIGHT]: 'ModelHeight',
   [MODEL_PART_CATEGORY]: 'ModelPartCategory',
   [MODEL_TIER]: 'ModelTier',
   [MODEL_TYPE]: 'ModelType',
   [MODEL_WIDTH]: 'ModelWidth',
   [ORIGINAL_CREATION_DATE]: 'SearchableDate',
   [PERMISSION_GROUP]: 'PermissionGroup',
   [PRIMARY_COLOR]: 'PrimaryColor',
   [PRODUCT_CLASS]: 'ProductClassAttribute',
   [PRODUCT_IMAGE_TYPE]: 'ProductImageType',
   [PRODUCT_STATUS]: 'ProductStatus',
   [PROP_CATEGORY]: 'PropCategory',
   [REGION]: 'Region',
   [REQUESTING_BRAND]: 'RequestingBrand',
   [REQUESTING_PROGRAM]: 'RequestingProgram',
   [ROOM_SETTING]: 'RoomSetting',
   [SEASON]: 'Season',
   [SECONDARY_COLOR]: 'SecondaryColor',
   [SKU]: 'SKU',
   [SOURCE_CATEGORY]: 'SourceCategory',
   [STYLE]: 'Style',
   [SUBSTYLE]: 'Substyle',
   [SUB_MODEL_PART_CATEGORY]: 'SubModelPartCategory',
   [SUB_PRODUCT_IMAGE_TYPE]: 'SubProductImageType',
   [SUB_SOURCE_CATEGORY]: 'Source',
   [FIELD_ASSET_ID]: FIELD_ASSET_ID,
 };
 
 // Mapping of Solr Fields back to User-Facing Titles
//  export const AGGREGATION_MAPPING = _.invert(FACET_FIELDS);
 
 // Standard Facets (Checkboxes, Multi-select)
 export const STANDARD_FACETS = [
   FACET_FIELDS[APPROVED],
   FACET_FIELDS[ASSET_CATEGORY],
   FACET_FIELDS[ASSET_ROOM_TYPE],
   FACET_FIELDS[BRAND_CATALOG],
   FACET_FIELDS[EXCLUSIVE_BRAND],
   FACET_FIELDS[FILE_TYPE],
   FACET_FIELDS[HOLIDAY],
   FACET_FIELDS[IMAGE_MEDIA_FORMAT],
   FACET_FIELDS[IMAGE_TYPE],
   FACET_FIELDS[LIFE_STAGE],
   FACET_FIELDS[MARKETING_CHANNEL],
   FACET_FIELDS[MODEL_TIER],
   FACET_FIELDS[MODEL_TYPE],
   FACET_FIELDS[PRIMARY_COLOR],
   FACET_FIELDS[PRODUCT_STATUS],
   FACET_FIELDS[PROP_CATEGORY],
   FACET_FIELDS[REGION],
   FACET_FIELDS[REQUESTING_BRAND],
   FACET_FIELDS[REQUESTING_PROGRAM],
   FACET_FIELDS[ROOM_SETTING],
   FACET_FIELDS[SEASON],
   FACET_FIELDS[SECONDARY_COLOR],
 ];
 
 // Cascading Facets (Radio Buttons, Single-Select, Parent-Child Relationships)
 export const CASCADING_FACETS = [
   FACET_FIELDS[MODELING_PROCESS],
   FACET_FIELDS[MODEL_PART_CATEGORY],
   FACET_FIELDS[PRODUCT_IMAGE_TYPE],
   FACET_FIELDS[SOURCE_CATEGORY],
   FACET_FIELDS[STYLE],
   FACET_FIELDS[SUBSTYLE],
   FACET_FIELDS[SUB_MODEL_PART_CATEGORY],
   FACET_FIELDS[SUB_PRODUCT_IMAGE_TYPE],
   FACET_FIELDS[SUB_SOURCE_CATEGORY],
 ];
 
 // Input Facets (Input Bar, Autocomplete Dropdown)
 export const INPUT_FACETS = [
   FACET_FIELDS[MODELER],
   FACET_FIELDS[PRODUCT_CLASS],
 ];
 
 // Admin Facets (Found in Admin Mode Dropdown)
 export const ADMIN_FACETS = [FACET_FIELDS[PERMISSION_GROUP]];
 
 // Facets for which to request aggregation data from the Search API
 export const AGGREGATED_FACETS = STANDARD_FACETS.concat(
   CASCADING_FACETS,
   INPUT_FACETS,
   ADMIN_FACETS
 );
 
 // Range Facets (Two Input Bars, From/To)
 export const RANGE_FACETS = [
   FACET_FIELDS[MODEL_HEIGHT],
   FACET_FIELDS[MODEL_WIDTH],
   FACET_FIELDS[MODEL_DEPTH],
   FACET_FIELDS[DATE_IMPORTED],
   FACET_FIELDS[ORIGINAL_CREATION_DATE],
 ];
 
 // Minimum Value Facets (Input Bar, "At Least")
 export const MINIMUM_VALUE_FACETS = [
   FACET_FIELDS[IMAGE_HEIGHT],
   FACET_FIELDS[IMAGE_WIDTH],
 ];
 
 // Mapping of Child to Parent Facets
 export const CHILD_PARENT_FACET_MAPPING = {
   [FACET_FIELDS[SUBSTYLE]]: FACET_FIELDS[STYLE],
   [FACET_FIELDS[SUB_SOURCE_CATEGORY]]: FACET_FIELDS[SOURCE_CATEGORY],
   [FACET_FIELDS[SUB_MODEL_PART_CATEGORY]]: FACET_FIELDS[MODEL_PART_CATEGORY],
   [FACET_FIELDS[SUB_PRODUCT_IMAGE_TYPE]]: FACET_FIELDS[PRODUCT_IMAGE_TYPE],
 };
 
 // Facets Related to 3D models
 export const MODEL_FACETS = [
   FACET_FIELDS[MODEL_HEIGHT],
   FACET_FIELDS[MODEL_WIDTH],
   FACET_FIELDS[MODEL_DEPTH],
   FACET_FIELDS[MODEL_TIER],
   FACET_FIELDS[MODELER],
 ];
 
 // Fields to be Returned in Search API Response Data
 export const UI_RETURN_FIELDS = [
   FACET_FIELDS[APPROVED],
   FACET_FIELDS[ASSET_CATEGORY],
   FACET_FIELDS[BRAND_CATALOG],
   FACET_FIELDS[EXCLUSIVE_BRAND],
   FACET_FIELDS[MODEL_DEPTH],
   FACET_FIELDS[MODEL_HEIGHT],
   FACET_FIELDS[MODEL_TIER],
   FACET_FIELDS[MODEL_WIDTH],
   FACET_FIELDS[REQUESTING_BRAND],
   FACET_FIELDS[SOURCE_CATEGORY],
   FACET_FIELDS[STYLE],
   FIELD_ASSET_ID,
   FIELD_ASSET_LEVEL_MTDOID,
   FIELD_DATE_TIME_IMPORTED,
   FIELD_DESCRIPTION,
   FIELD_DOCUMENT_RESOURCE_ID,
   FIELD_IMAGE_ID,
   FIELD_METADATA_ID,
   FIELD_NAME,
   FIELD_PREVIEW_IRE_ID,
   FIELD_PRIMARY_COLOR,
   FIELD_SEARCHABLE_DATE,
   FIELD_VIDEO_RESOURCE_ID,
   FIELD_MPID_DISPLAYSKU,
   FIELD_MANUFACTURER_PARTID,
 ];
 
 // Special Values
 export const UNDEFINED_VALUE = 'Undefined';
 export const MODEL_VALUE = '3D Model';
 export const NEGATIVE_BOOST_REQUESTING_PROGRAM = '3D Custom Rendering';
 export const ENTRY_TYPE_ASSET_VALUE = 'Asset';
 
 // Facet Types
 export const MINIMUM_VALUE_TYPE = 'minimum_value';
 export const RANGE_TYPE = 'range';
 export const ADMIN_TYPE = 'admin';
 
 // Filters to ignore when making filter preference options (user-facing admin and cascading filter names)
 export const FILTERS_TO_IGNORE = [
   PERMISSION_GROUP,
   MODEL_PART_CATEGORY,
   PRODUCT_IMAGE_TYPE,
   SOURCE_CATEGORY,
   STYLE,
   SUBSTYLE,
   SUB_MODEL_PART_CATEGORY,
   SUB_PRODUCT_IMAGE_TYPE,
   SUB_SOURCE_CATEGORY,
 ];
 
 // Bundling cascading filters together into special options
 export const SPECIAL_FILTER_OPTIONS = {
   MODEL_PART_CATEGORY_SPECIAL: {
     value: `${MODEL_PART_CATEGORY} / ${SUB_MODEL_PART_CATEGORY}`,
     internalName: [
       FACET_FIELDS[MODEL_PART_CATEGORY],
       FACET_FIELDS[SUB_MODEL_PART_CATEGORY],
     ],
   },
   PRODUCT_IMAGE_TYPE_SPECIAL: {
     value: `${PRODUCT_IMAGE_TYPE} / ${SUB_PRODUCT_IMAGE_TYPE}`,
     internalName: [
       FACET_FIELDS[PRODUCT_IMAGE_TYPE],
       FACET_FIELDS[SUB_PRODUCT_IMAGE_TYPE],
     ],
   },
   SOURCE_CATEGORY_SPECIAL: {
     value: `${SOURCE_CATEGORY} / ${SUB_SOURCE_CATEGORY}`,
     internalName: [
       FACET_FIELDS[SOURCE_CATEGORY],
       FACET_FIELDS[SUB_SOURCE_CATEGORY],
     ],
   },
   STYLE_SPECIAL: {
     value: `${STYLE} / ${SUBSTYLE}`,
     internalName: [FACET_FIELDS[STYLE], FACET_FIELDS[SUBSTYLE]],
   },
 };
 
 // Given a cascading filter, determine special option to supplement
 export const CASCADING_TO_SPECIAL_MAPPING = {
   [MODEL_PART_CATEGORY]: SPECIAL_FILTER_OPTIONS.MODEL_PART_CATEGORY_SPECIAL,
   [SUB_MODEL_PART_CATEGORY]: SPECIAL_FILTER_OPTIONS.MODEL_PART_CATEGORY_SPECIAL,
   [PRODUCT_IMAGE_TYPE]: SPECIAL_FILTER_OPTIONS.PRODUCT_IMAGE_TYPE_SPECIAL,
   [SUB_PRODUCT_IMAGE_TYPE]: SPECIAL_FILTER_OPTIONS.PRODUCT_IMAGE_TYPE_SPECIAL,
   [SOURCE_CATEGORY]: SPECIAL_FILTER_OPTIONS.SOURCE_CATEGORY_SPECIAL,
   [SUB_SOURCE_CATEGORY]: SPECIAL_FILTER_OPTIONS.SOURCE_CATEGORY_SPECIAL,
   [STYLE]: SPECIAL_FILTER_OPTIONS.STYLE_SPECIAL,
   [SUBSTYLE]: SPECIAL_FILTER_OPTIONS.STYLE_SPECIAL,
 };
 

enum FilterType {
    // Multi select checkbox 
    Standard = 'standard',
    Cascading = 'cascading',
    // Input with autocomplete
    Input = 'input',
    // Only in admin panel
    Admin = 'admin',
    // Two input bars.
    Range = 'range',
    // Minu
    MinValue = 'minimum_value',
}

const getFilterType = (filter: string): FilterType | undefined => {
    if (STANDARD_FACETS.includes(filter)) {
        return FilterType.Standard
    } else if (CASCADING_FACETS.includes(filter)) {
        return FilterType.Cascading
    } else if (INPUT_FACETS.includes(filter)) {
        return FilterType.Input
    } else if (ADMIN_FACETS.includes(filter)) {
        return FilterType.Admin
    } else if (RANGE_FACETS.includes(filter)) {
        return FilterType.Range
    } else if (ADMIN_FACETS.includes(filter)) {
        return FilterType.Admin
    } else if (RANGE_FACETS.includes(filter)) {
        return FilterType.Range
    } else if (MINIMUM_VALUE_FACETS.includes(filter)) {
        return FilterType.MinValue
    }
}

interface StringMap { [key: string]: string; }

export const createFilterSchema = (filters: StringMap) => {
    return Object.entries(filters).map(([key, value]) => {
        return {
            id: value,
            mapping: [
                { service: "search_ui", label: key },
                { service: "search_api", label: value }
            ],
            properties: {
                type:"",
                search_ui_filter: SIDEBAR_FACETS.includes(key),
                search_ui_aggregation: AGGREGATED_FACETS.includes(value),
                search_ui_return: UI_RETURN_FIELDS.includes(value),
                search_ui_filter_type: getFilterType(value),
                parent_id: CHILD_PARENT_FACET_MAPPING[value]
            }
        }
    })
}

export const FILTER_SCHEMA = (() => {
    const schema = createFilterSchema(FACET_FIELDS);
    schema.sort((a, b) => a.id.localeCompare(b.id));
    return schema;
})()

console.log(FILTER_SCHEMA)
const isDefined = (x: any) => x !== undefined && x !== null
const searchFilter = FILTER_SCHEMA.filter(f => isDefined(f.properties?.search_ui_filter)).filter(f => f.properties?.search_ui_filter)
const searchFilterId = searchFilter.map(f => f.id)
const searchFilterTypes = FILTER_SCHEMA.filter(f => isDefined(f.properties?.search_ui_filter_type))
const searchFilterTypeId = searchFilterTypes.map(f => f.id)

const diff = searchFilterId.filter(x => !searchFilterTypeId.includes(x))
console.log("SIDEBAR FILTERS", searchFilter.length)
console.log("SIDEBAR FILTERS TYPE", searchFilterTypes.length)
console.log("Diff" , diff)

const resultJson = [
    {
        "id": "Approved",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Approved in WDS"
            },
            {
                "service": "search_api",
                "label": "Approved"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": true,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "AssetCategory",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Asset Category"
            },
            {
                "service": "search_api",
                "label": "AssetCategory"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": true,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "AssetID",
        "mapping": [
            {
                "service": "search_ui",
                "label": "AssetID"
            },
            {
                "service": "search_api",
                "label": "AssetID"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": false,
            "search_ui_aggregation": false,
            "search_ui_return": true
        }
    },
    {
        "id": "AssetRoomType",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Asset Room Type"
            },
            {
                "service": "search_api",
                "label": "AssetRoomType"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "BrandCatalog",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Brand Catalog"
            },
            {
                "service": "search_api",
                "label": "BrandCatalog"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": true,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "CreativeBriefID",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Creative Brief ID"
            },
            {
                "service": "search_api",
                "label": "CreativeBriefID"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": false,
            "search_ui_aggregation": false,
            "search_ui_return": false
        }
    },
    {
        "id": "DateTimeImported",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Date Imported"
            },
            {
                "service": "search_api",
                "label": "DateTimeImported"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": false,
            "search_ui_return": true,
            "search_ui_filter_type": "range"
        }
    },
    {
        "id": "ExclusiveBrand",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Exclusive Brand"
            },
            {
                "service": "search_api",
                "label": "ExclusiveBrand"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": true,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "FileExtension",
        "mapping": [
            {
                "service": "search_ui",
                "label": "File Type"
            },
            {
                "service": "search_api",
                "label": "FileExtension"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "Holiday",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Holiday"
            },
            {
                "service": "search_api",
                "label": "Holiday"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "ImageHeight",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Image Height"
            },
            {
                "service": "search_api",
                "label": "ImageHeight"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": false,
            "search_ui_return": false,
            "search_ui_filter_type": "minimum_value"
        }
    },
    {
        "id": "ImageMediaFormat",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Image Media Format"
            },
            {
                "service": "search_api",
                "label": "ImageMediaFormat"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "ImageType",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Image Type"
            },
            {
                "service": "search_api",
                "label": "ImageType"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "ImageWidth",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Image Width"
            },
            {
                "service": "search_api",
                "label": "ImageWidth"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": false,
            "search_ui_return": false,
            "search_ui_filter_type": "minimum_value"
        }
    },
    {
        "id": "LifeStage",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Life Stage"
            },
            {
                "service": "search_api",
                "label": "LifeStage"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "ManufacturerPartID",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Manufacturer Part ID"
            },
            {
                "service": "search_api",
                "label": "ManufacturerPartID"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": false,
            "search_ui_aggregation": false,
            "search_ui_return": true
        }
    },
    {
        "id": "MarketingChannel",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Marketing Channel"
            },
            {
                "service": "search_api",
                "label": "MarketingChannel"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "ModelDepth",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Model Depth"
            },
            {
                "service": "search_api",
                "label": "ModelDepth"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": false,
            "search_ui_return": true,
            "search_ui_filter_type": "range"
        }
    },
    {
        "id": "Modeler",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Modeler"
            },
            {
                "service": "search_api",
                "label": "Modeler"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "input"
        }
    },
    {
        "id": "ModelHeight",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Model Height"
            },
            {
                "service": "search_api",
                "label": "ModelHeight"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": false,
            "search_ui_return": true,
            "search_ui_filter_type": "range"
        }
    },
    {
        "id": "ModelingProcess",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Modeling Process"
            },
            {
                "service": "search_api",
                "label": "ModelingProcess"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "cascading"
        }
    },
    {
        "id": "ModelPartCategory",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Model Part Category"
            },
            {
                "service": "search_api",
                "label": "ModelPartCategory"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "cascading"
        }
    },
    {
        "id": "ModelTier",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Model Tier"
            },
            {
                "service": "search_api",
                "label": "ModelTier"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": true,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "ModelType",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Model Type"
            },
            {
                "service": "search_api",
                "label": "ModelType"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "ModelWidth",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Model Width"
            },
            {
                "service": "search_api",
                "label": "ModelWidth"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": false,
            "search_ui_return": true,
            "search_ui_filter_type": "range"
        }
    },
    {
        "id": "PermissionGroup",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Permission Group"
            },
            {
                "service": "search_api",
                "label": "PermissionGroup"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "admin"
        }
    },
    {
        "id": "PrimaryColor",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Primary Color"
            },
            {
                "service": "search_api",
                "label": "PrimaryColor"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": true,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "ProductClass",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Legacy Product Class"
            },
            {
                "service": "search_api",
                "label": "ProductClass"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": false,
            "search_ui_return": false
        }
    },
    {
        "id": "ProductClassAttribute",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Product Class"
            },
            {
                "service": "search_api",
                "label": "ProductClassAttribute"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "input"
        }
    },
    {
        "id": "ProductImageType",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Product Image Type"
            },
            {
                "service": "search_api",
                "label": "ProductImageType"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "cascading"
        }
    },
    {
        "id": "ProductStatus",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Live On Site"
            },
            {
                "service": "search_api",
                "label": "ProductStatus"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "PropCategory",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Prop Category"
            },
            {
                "service": "search_api",
                "label": "PropCategory"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "Region",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Region"
            },
            {
                "service": "search_api",
                "label": "Region"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "RequestingBrand",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Requesting Brand"
            },
            {
                "service": "search_api",
                "label": "RequestingBrand"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": true,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "RequestingProgram",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Requesting Program"
            },
            {
                "service": "search_api",
                "label": "RequestingProgram"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "RoomSetting",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Room Setting"
            },
            {
                "service": "search_api",
                "label": "RoomSetting"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "SearchableDate",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Date Updated"
            },
            {
                "service": "search_api",
                "label": "SearchableDate"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": false,
            "search_ui_return": true,
            "search_ui_filter_type": "range"
        }
    },
    {
        "id": "Season",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Season"
            },
            {
                "service": "search_api",
                "label": "Season"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "SecondaryColor",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Secondary Color"
            },
            {
                "service": "search_api",
                "label": "SecondaryColor"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "standard"
        }
    },
    {
        "id": "SKU",
        "mapping": [
            {
                "service": "search_ui",
                "label": "SKU"
            },
            {
                "service": "search_api",
                "label": "SKU"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": false,
            "search_ui_aggregation": false,
            "search_ui_return": false
        }
    },
    {
        "id": "Source",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Sub Source Category"
            },
            {
                "service": "search_api",
                "label": "Source"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "cascading",
            "parent_id": "SourceCategory"
        }
    },
    {
        "id": "SourceCategory",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Source Category"
            },
            {
                "service": "search_api",
                "label": "SourceCategory"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": true,
            "search_ui_filter_type": "cascading"
        }
    },
    {
        "id": "Style",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Style"
            },
            {
                "service": "search_api",
                "label": "Style"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": true,
            "search_ui_filter_type": "cascading"
        }
    },
    {
        "id": "SubModelPartCategory",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Sub Model Part Category"
            },
            {
                "service": "search_api",
                "label": "SubModelPartCategory"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "cascading",
            "parent_id": "ModelPartCategory"
        }
    },
    {
        "id": "SubProductImageType",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Sub Product Image Type"
            },
            {
                "service": "search_api",
                "label": "SubProductImageType"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "cascading",
            "parent_id": "ProductImageType"
        }
    },
    {
        "id": "Substyle",
        "mapping": [
            {
                "service": "search_ui",
                "label": "Substyle"
            },
            {
                "service": "search_api",
                "label": "Substyle"
            }
        ],
        "properties": {
            "type": "",
            "search_ui_filter": true,
            "search_ui_aggregation": true,
            "search_ui_return": false,
            "search_ui_filter_type": "cascading",
            "parent_id": "Style"
        }
    }
]
