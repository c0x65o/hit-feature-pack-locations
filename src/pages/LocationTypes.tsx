'use client';

import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Package,
  ShoppingBag,
  Building,
  Cog,
} from 'lucide-react';
import { useUi, useAlertDialog } from '@hit/ui-kit';
import { useLocationTypes, useLocationTypeMutations } from '../hooks/useLocationTypes';

interface LocationTypesProps {
  onNavigate?: (path: string) => void;
}

// Icon mapping for location types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap: Record<string, React.ComponentType<any>> = {
  Building2,
  Package,
  ShoppingBag,
  Building,
  Cog,
};

export function LocationTypes({
  onNavigate,
}: LocationTypesProps) {
  const { Page, Card, Button, DataTable, Badge, Alert, Modal, Input, AlertDialog } = useUi();
  const alertDialog = useAlertDialog();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    icon: 'Building2',
    color: '#3b82f6',
    description: '',
  });

  const { types, loading, error, refresh } = useLocationTypes();
  const typesArray = Array.isArray(types) ? types : [];
  const { createType, updateType, deleteType, loading: mutating } = useLocationTypeMutations();

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const handleCreate = () => {
    setSelectedType(null);
    setFormData({
      name: '',
      code: '',
      icon: 'Building2',
      color: '#3b82f6',
      description: '',
    });
    setEditModalOpen(true);
  };

  const handleEdit = (type: any) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      code: type.code,
      icon: type.icon,
      color: type.color,
      description: type.description || '',
    });
    setEditModalOpen(true);
  };

  const handleDelete = async (type: any) => {
    if (type.isSystem) {
      await alertDialog.showAlert('System types cannot be deleted', {
        variant: 'warning',
        title: 'Cannot Delete'
      });
      return;
    }
    setSelectedType(type);
    setDeleteModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedType) {
        await updateType(selectedType.id, formData);
      } else {
        await createType(formData);
      }
      setEditModalOpen(false);
      refresh();
    } catch (e) {
      // Error handled by hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedType) return;
    try {
      await deleteType(selectedType.id);
      setDeleteModalOpen(false);
      setSelectedType(null);
      refresh();
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <Page
      title="Location Types"
      description="Manage location type categories and icons"
      actions={
        <Button variant="primary" onClick={handleCreate}>
          <Plus size={16} className="mr-2" />
          New Type
        </Button>
      }
    >
      {error && (
        <Alert variant="error" title="Error loading location types">
          {error.message}
        </Alert>
      )}

      <Card>
        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Name',
              sortable: true,
              render: (_: unknown, row: Record<string, unknown>) => {
                const IconComponent = iconMap[row.icon as string] || Building2;
                const iconColor = row.color as string;
                return (
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded"
                      style={{ backgroundColor: `${iconColor}20` }}
                    >
                      <IconComponent
                        size={16}
                        color={iconColor}
                      />
                    </div>
                    <span className="font-medium">{row.name as string}</span>
                  </div>
                );
              },
            },
            {
              key: 'code',
              label: 'Code',
              sortable: true,
              render: (value: unknown) => (
                <code className="text-sm">{value as string}</code>
              ),
            },
            {
              key: 'color',
              label: 'Color',
              render: (value: unknown) => (
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-700"
                    style={{ backgroundColor: value as string }}
                  />
                  <code className="text-xs">{value as string}</code>
                </div>
              ),
            },
            {
              key: 'isSystem',
              label: 'Type',
              render: (value: unknown) =>
                value ? (
                  <Badge variant="default">System</Badge>
                ) : (
                  <Badge variant="success">Custom</Badge>
                ),
            },
            {
              key: 'description',
              label: 'Description',
              render: (value: unknown) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {(value as string) || '-'}
                </span>
              ),
            },
            {
              key: 'actions',
              label: '',
              align: 'right' as const,
              sortable: false,
              hideable: false,
              render: (_: unknown, row: Record<string, unknown>) => (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(row)}
                    disabled={mutating}
                  >
                    <Edit size={16} />
                  </Button>
                  {!row.isSystem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(row)}
                      disabled={mutating}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={typesArray.map((type) => ({
            id: type.id,
            name: type.name,
            code: type.code,
            icon: type.icon,
            color: type.color,
            description: type.description,
            isSystem: type.isSystem,
          }))}
          emptyMessage="No location types found"
          loading={loading}
          exportable
          showColumnVisibility
        />
      </Card>

      {/* Edit/Create Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedType ? 'Edit Location Type' : 'Create Location Type'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <Input
              value={formData.name}
              onChange={(val: string) => setFormData({ ...formData, name: val })}
              placeholder="e.g., Warehouse"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Code</label>
            <Input
              value={formData.code}
              onChange={(val: string) => setFormData({ ...formData, code: val.toLowerCase().replace(/\s+/g, '_') })}
              placeholder="e.g., warehouse"
              disabled={!!selectedType}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Unique identifier (cannot be changed after creation)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <Input
              value={formData.icon}
              onChange={(val: string) => setFormData({ ...formData, icon: val })}
              placeholder="e.g., Building2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Lucide React icon name
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 rounded border border-gray-300 dark:border-gray-700 cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={(val: string) => setFormData({ ...formData, color: val })}
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              value={formData.description}
              onChange={(val: string) => setFormData({ ...formData, description: val })}
              placeholder="Optional description"
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!formData.name || !formData.code || mutating}
            >
              {selectedType ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedType(null);
        }}
        title="Delete Location Type"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete "{selectedType?.name}"? This cannot be undone.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Locations using this type will have their type set to null.
          </p>
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              disabled={mutating}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
      <AlertDialog {...alertDialog.props} />
    </Page>
  );
}

export default LocationTypes;

