import * as coreClient from "@azure/core-client";

export const SpecBoxWebApiModelUploadData: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelUploadData",
    modelProperties: {
      features: {
        serializedName: "features",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "SpecBoxWebApiModelUploadFeatureModel"
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
              className: "SpecBoxWebApiModelUploadAttributeModel"
            }
          }
        }
      }
    }
  }
};

export const SpecBoxWebApiModelUploadFeatureModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelUploadFeatureModel",
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
      filePath: {
        serializedName: "filePath",
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
              className: "SpecBoxWebApiModelUploadAssertionGroupModel"
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

export const SpecBoxWebApiModelUploadAssertionGroupModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelUploadAssertionGroupModel",
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
              className: "SpecBoxWebApiModelUploadAssertionModel"
            }
          }
        }
      }
    }
  }
};

export const SpecBoxWebApiModelUploadAssertionModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelUploadAssertionModel",
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

export const SpecBoxWebApiModelUploadAttributeModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelUploadAttributeModel",
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
              className: "SpecBoxWebApiModelUploadAttributeValueModel"
            }
          }
        }
      }
    }
  }
};

export const SpecBoxWebApiModelUploadAttributeValueModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelUploadAttributeValueModel",
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

export const SpecBoxWebApiModelProjectFeatureModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelProjectFeatureModel",
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
      assertionGroups: {
        serializedName: "assertionGroups",
        required: true,
        readOnly: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "SpecBoxWebApiModelProjectAssertionGroupModel"
            }
          }
        }
      }
    }
  }
};

export const SpecBoxWebApiModelProjectAssertionGroupModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelProjectAssertionGroupModel",
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
        readOnly: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "SpecBoxWebApiModelProjectAssertionModel"
            }
          }
        }
      }
    }
  }
};

export const SpecBoxWebApiModelProjectAssertionModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelProjectAssertionModel",
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

export const SpecBoxWebApiModelProjectStructureModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelProjectStructureModel",
    modelProperties: {
      tree: {
        serializedName: "tree",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "SpecBoxWebApiModelProjectTreeNodeModel"
            }
          }
        }
      }
    }
  }
};

export const SpecBoxWebApiModelProjectTreeNodeModel: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelProjectTreeNodeModel",
    modelProperties: {
      id: {
        constraints: {
          MinLength: 1
        },
        serializedName: "id",
        required: true,
        type: {
          name: "String"
        }
      },
      path: {
        serializedName: "path",
        required: true,
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "String"
            }
          }
        }
      },
      parentId: {
        serializedName: "parentId",
        nullable: true,
        type: {
          name: "String"
        }
      },
      featureCode: {
        serializedName: "featureCode",
        nullable: true,
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
      totalCount: {
        serializedName: "totalCount",
        required: true,
        type: {
          name: "Number"
        }
      },
      automatedCount: {
        serializedName: "automatedCount",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};

export const SpecBoxWebApiModelStatAutotestsStatUploadData: coreClient.CompositeMapper = {
  type: {
    name: "Composite",
    className: "SpecBoxWebApiModelStatAutotestsStatUploadData",
    modelProperties: {
      timestamp: {
        serializedName: "timestamp",
        required: true,
        type: {
          name: "DateTime"
        }
      },
      duration: {
        serializedName: "duration",
        required: true,
        type: {
          name: "Number"
        }
      },
      assertionsCount: {
        serializedName: "assertionsCount",
        required: true,
        type: {
          name: "Number"
        }
      }
    }
  }
};
