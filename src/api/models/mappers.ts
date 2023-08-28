import * as coreClient from "@azure/core-client";

export const UploadData: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "UploadData",
    modelProperties: {
      features: {
        serializedName: "features",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "FeatureModel"
            }
          }
        }
      },
      attributes: {
        serializedName: "attributes",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "AttributeModel"
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
        constraints: {
          MinLength: 1
        },
        serializedName: "code",
        required: true,
        type: {
          name: "String"
        }
      },
      title: {
        constraints: {
          MinLength: 1
        },
        serializedName: "title",
        required: true,
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
        required: true,
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
        constraints: {
          MinLength: 1
        },
        serializedName: "title",
        required: true,
        type: {
          name: "String"
        }
      },
      assertions: {
        serializedName: "assertions",
        required: true,
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
        constraints: {
          MinLength: 1
        },
        serializedName: "title",
        required: true,
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
        required: true,
        type: {
          name: "Boolean"
        }
      }
    }
  }
};

export const AttributeModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AttributeModel",
    modelProperties: {
      code: {
        constraints: {
          MinLength: 1
        },
        serializedName: "code",
        required: true,
        type: {
          name: "String"
        }
      },
      title: {
        constraints: {
          MinLength: 1
        },
        serializedName: "title",
        required: true,
        type: {
          name: "String"
        }
      },
      values: {
        serializedName: "values",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "AttributeValueModel"
            }
          }
        }
      }
    }
  }
};

export const AttributeValueModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "AttributeValueModel",
    modelProperties: {
      code: {
        constraints: {
          MinLength: 1
        },
        serializedName: "code",
        required: true,
        type: {
          name: "String"
        }
      },
      title: {
        constraints: {
          MinLength: 1
        },
        serializedName: "title",
        required: true,
        type: {
          name: "String"
        }
      }
    }
  }
};
