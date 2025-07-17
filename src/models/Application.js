module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        isUrl: true,
        len: [1, 500]
      }
    },
    iconPath: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Path to the application icon file'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [1, 50]
      }
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    backgroundColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: /^#[0-9A-F]{6}$/i
      },
      comment: 'Hex color code for application tile background'
    },
    textColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: /^#[0-9A-F]{6}$/i
      },
      comment: 'Hex color code for application tile text'
    },
    requiresAuth: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the application requires authentication'
    },
    openInNewTab: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether to open the application in a new tab/window'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'applications',
    timestamps: true,
    indexes: [
      {
        fields: ['displayOrder']
      },
      {
        fields: ['category']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['name']
      }
    ]
  });

  // Instance methods
  Application.prototype.getIconUrl = function(baseUrl = '') {
    if (this.iconPath) {
      return `${baseUrl}/uploads/${this.iconPath}`;
    }
    return null;
  };

  // Class methods
  Application.findActive = function(options = {}) {
    return this.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC'], ['name', 'ASC']],
      ...options
    });
  };

  Application.findByCategory = function(category, options = {}) {
    return this.findAll({
      where: { 
        category,
        isActive: true 
      },
      order: [['displayOrder', 'ASC'], ['name', 'ASC']],
      ...options
    });
  };

  Application.getNextDisplayOrder = async function() {
    const maxOrder = await this.max('displayOrder');
    return (maxOrder || 0) + 1;
  };

  Application.reorderApplications = async function(applicationIds) {
    const transaction = await sequelize.transaction();
    
    try {
      for (let i = 0; i < applicationIds.length; i++) {
        await this.update(
          { displayOrder: i + 1 },
          { 
            where: { id: applicationIds[i] },
            transaction
          }
        );
      }
      
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  return Application;
};
