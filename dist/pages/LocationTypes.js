'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Plus, Edit, Trash2, Building2, Package, ShoppingBag, Building, Cog, } from 'lucide-react';
import { useUi } from '@hit/ui-kit';
import { useLocationTypes, useLocationTypeMutations } from '../hooks/useLocationTypes';
// Icon mapping for location types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconMap = {
    Building2,
    Package,
    ShoppingBag,
    Building,
    Cog,
};
export function LocationTypes({ onNavigate, }) {
    const { Page, Card, Button, DataTable, Badge, Alert, Modal, Input } = useUi();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        icon: 'Building2',
        color: '#3b82f6',
        description: '',
    });
    const { types, loading, error, refresh } = useLocationTypes();
    const { createType, updateType, deleteType, loading: mutating } = useLocationTypeMutations();
    const navigate = (path) => {
        if (onNavigate) {
            onNavigate(path);
        }
        else if (typeof window !== 'undefined') {
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
    const handleEdit = (type) => {
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
    const handleDelete = async (type) => {
        if (type.isSystem) {
            alert('System types cannot be deleted');
            return;
        }
        setSelectedType(type);
        setDeleteModalOpen(true);
    };
    const handleSave = async () => {
        try {
            if (selectedType) {
                await updateType(selectedType.id, formData);
            }
            else {
                await createType(formData);
            }
            setEditModalOpen(false);
            refresh();
        }
        catch (e) {
            // Error handled by hook
        }
    };
    const handleConfirmDelete = async () => {
        if (!selectedType)
            return;
        try {
            await deleteType(selectedType.id);
            setDeleteModalOpen(false);
            setSelectedType(null);
            refresh();
        }
        catch (e) {
            // Error handled by hook
        }
    };
    return (_jsxs(Page, { title: "Location Types", description: "Manage location type categories and icons", actions: _jsxs(Button, { variant: "primary", onClick: handleCreate, children: [_jsx(Plus, { size: 16, className: "mr-2" }), "New Type"] }), children: [error && (_jsx(Alert, { variant: "error", title: "Error loading location types", children: error.message })), _jsx(Card, { children: _jsx(DataTable, { columns: [
                        {
                            key: 'name',
                            label: 'Name',
                            sortable: true,
                            render: (_, row) => {
                                const IconComponent = iconMap[row.icon] || Building2;
                                const iconColor = row.color;
                                return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "p-1.5 rounded", style: { backgroundColor: `${iconColor}20` }, children: _jsx(IconComponent, { size: 16, color: iconColor }) }), _jsx("span", { className: "font-medium", children: row.name })] }));
                            },
                        },
                        {
                            key: 'code',
                            label: 'Code',
                            sortable: true,
                            render: (value) => (_jsx("code", { className: "text-sm", children: value })),
                        },
                        {
                            key: 'color',
                            label: 'Color',
                            render: (value) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-6 h-6 rounded border border-gray-300 dark:border-gray-700", style: { backgroundColor: value } }), _jsx("code", { className: "text-xs", children: value })] })),
                        },
                        {
                            key: 'isSystem',
                            label: 'Type',
                            render: (value) => value ? (_jsx(Badge, { variant: "default", children: "System" })) : (_jsx(Badge, { variant: "success", children: "Custom" })),
                        },
                        {
                            key: 'description',
                            label: 'Description',
                            render: (value) => (_jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: value || '-' })),
                        },
                        {
                            key: 'actions',
                            label: '',
                            align: 'right',
                            sortable: false,
                            hideable: false,
                            render: (_, row) => (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleEdit(row), disabled: mutating, children: _jsx(Edit, { size: 16 }) }), !row.isSystem && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDelete(row), disabled: mutating, children: _jsx(Trash2, { size: 16, className: "text-red-500" }) }))] })),
                        },
                    ], data: types.map((type) => ({
                        id: type.id,
                        name: type.name,
                        code: type.code,
                        icon: type.icon,
                        color: type.color,
                        description: type.description,
                        isSystem: type.isSystem,
                    })), emptyMessage: "No location types found", loading: loading, exportable: true, showColumnVisibility: true }) }), _jsx(Modal, { open: editModalOpen, onClose: () => setEditModalOpen(false), title: selectedType ? 'Edit Location Type' : 'Create Location Type', children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Name" }), _jsx(Input, { value: formData.name, onChange: (val) => setFormData({ ...formData, name: val }), placeholder: "e.g., Warehouse" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Code" }), _jsx(Input, { value: formData.code, onChange: (val) => setFormData({ ...formData, code: val.toLowerCase().replace(/\s+/g, '_') }), placeholder: "e.g., warehouse", disabled: !!selectedType }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Unique identifier (cannot be changed after creation)" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Icon" }), _jsx(Input, { value: formData.icon, onChange: (val) => setFormData({ ...formData, icon: val }), placeholder: "e.g., Building2" }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Lucide React icon name" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Color" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "color", value: formData.color, onChange: (e) => setFormData({ ...formData, color: e.target.value }), className: "w-16 h-10 rounded border border-gray-300 dark:border-gray-700 cursor-pointer" }), _jsx(Input, { value: formData.color, onChange: (val) => setFormData({ ...formData, color: val }), placeholder: "#3b82f6" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Description" }), _jsx(Input, { value: formData.description, onChange: (val) => setFormData({ ...formData, description: val }), placeholder: "Optional description" })] }), _jsxs("div", { className: "flex items-center gap-2 justify-end", children: [_jsx(Button, { variant: "secondary", onClick: () => setEditModalOpen(false), children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleSave, disabled: !formData.name || !formData.code || mutating, children: selectedType ? 'Update' : 'Create' })] })] }) }), _jsx(Modal, { open: deleteModalOpen, onClose: () => {
                    setDeleteModalOpen(false);
                    setSelectedType(null);
                }, title: "Delete Location Type", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("p", { children: ["Are you sure you want to delete \"", selectedType?.name, "\"? This cannot be undone."] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Locations using this type will have their type set to null." }), _jsxs("div", { className: "flex items-center gap-2 justify-end", children: [_jsx(Button, { variant: "secondary", onClick: () => {
                                        setDeleteModalOpen(false);
                                        setSelectedType(null);
                                    }, children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleConfirmDelete, disabled: mutating, children: "Delete" })] })] }) })] }));
}
export default LocationTypes;
//# sourceMappingURL=LocationTypes.js.map