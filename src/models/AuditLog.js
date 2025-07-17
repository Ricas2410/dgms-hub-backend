module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    action: {
      type: DataTypes.ENUM(
        'CREATE',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'REORDER',
        'ACTIVATE',
        'DEACTIVATE'
      ),
      allowNull: false
    },
    entityType: {
      type: DataTypes.ENUM('USER', 'APPLICATION', 'SYSTEM'),
      allowNull: false
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'ID of the entity that was affected'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Applications',
        key: 'id'
      }
    },
    oldValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Previous values before the change'
    },
    newValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'New values after the change'
    },
    ipAddress: {
      type: DataTypes.INET,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Human-readable description of the action'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional metadata about the action'
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false, // Audit logs should not be updated
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['applicationId']
      },
      {
        fields: ['action']
      },
      {
        fields: ['entityType']
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['entityId']
      }
    ]
  });

  // Class methods
  AuditLog.logAction = async function(data) {
    const {
      action,
      entityType,
      entityId,
      userId,
      applicationId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      description,
      metadata
    } = data;

    return await this.create({
      action,
      entityType,
      entityId,
      userId,
      applicationId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      description,
      metadata
    });
  };

  AuditLog.getRecentActivity = function(limit = 50, offset = 0) {
    return this.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          association: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          association: 'application',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });
  };

  AuditLog.getUserActivity = function(userId, limit = 50, offset = 0) {
    return this.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          association: 'application',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });
  };

  AuditLog.getApplicationActivity = function(applicationId, limit = 50, offset = 0) {
    return this.findAndCountAll({
      where: { applicationId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          association: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });
  };

  return AuditLog;
};
