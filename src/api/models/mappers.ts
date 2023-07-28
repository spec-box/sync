import * as coreClient from "@azure/core-client";

export const UploadData: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UploadData",
    modelProperties: {
      features: {
        serializedName: "features",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "FeatureModel"
            }
          }
        }
      }
    }
  }
};

export const FeatureModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "FeatureModel",
    modelProperties: {
      code: {
        serializedName: "code",
        type: {
          name: "String"
        }
      },
      title: {
        serializedName: "title",
        type: {
          name: "String"
        }
      },
      description: {
        serializedName: "description",
        nullable: true,
        type: {
          name: "String"
        }
      },
      groups: {
        serializedName: "groups",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "AssertionGroupModel"
            }
          }
        }
      },
      attributes: {
        serializedName: "attributes",
        nullable: true,
        type: {
          name: "Dictionary",
          value: {
            type: { name: "Sequence", element: { type: { name: "String" } } }
          }
        }
      }
    }
  }
};

export const AssertionGroupModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AssertionGroupModel",
    modelProperties: {
      title: {
        serializedName: "title",
        type: {
          name: "String"
        }
      },
      assertions: {
        serializedName: "assertions",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "AssertionModel"
            }
          }
        }
      }
    }
  }
};

export const AssertionModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AssertionModel",
    modelProperties: {
      title: {
        serializedName: "title",
        type: {
          name: "String"
        }
      },
      description: {
        serializedName: "description",
        nullable: true,
        type: {
          name: "String"
        }
      },
      isAutomated: {
        serializedName: "isAutomated",
        type: {
          name: "Boolean"
        }
      }
    }
  }
};
