import { useState, useRef, useCallback } from 'react';
import { Signature, Type, Calendar, CheckSquare, ChevronDown, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Recipient, SignatureField, FieldType } from '@/contexts/SigningContext';

interface FieldPlacementCanvasProps {
  fileUrl: string | null;
  recipients: Recipient[];
  fields: SignatureField[];
  onFieldsChange: (fields: SignatureField[]) => void;
}

const fieldTypes: { type: FieldType; label: string; icon: React.ComponentType<any>; defaultSize: { width: number; height: number } }[] = [
  { type: 'signature', label: 'Signature', icon: Signature, defaultSize: { width: 200, height: 60 } },
  { type: 'initials', label: 'Initials', icon: Type, defaultSize: { width: 80, height: 40 } },
  { type: 'date', label: 'Date', icon: Calendar, defaultSize: { width: 120, height: 30 } },
  { type: 'text', label: 'Text', icon: Type, defaultSize: { width: 150, height: 30 } },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, defaultSize: { width: 24, height: 24 } },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, defaultSize: { width: 150, height: 30 } },
];

export function FieldPlacementCanvas({ fileUrl, recipients, fields, onFieldsChange }: FieldPlacementCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string>(recipients[0]?.id || '');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [draggingField, setDraggingField] = useState<SignatureField | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const signers = recipients.filter(r => r.role === 'signer' || r.role === 'approver');

  const addField = useCallback((type: FieldType) => {
    if (!selectedRecipient) return;
    
    const fieldConfig = fieldTypes.find(f => f.type === type);
    if (!fieldConfig) return;

    const newField: SignatureField = {
      id: crypto.randomUUID(),
      type,
      recipientId: selectedRecipient,
      page: 1,
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      width: fieldConfig.defaultSize.width,
      height: fieldConfig.defaultSize.height,
      required: type === 'signature',
      completed: false,
    };

    onFieldsChange([...fields, newField]);
    setSelectedField(newField.id);
  }, [selectedRecipient, fields, onFieldsChange]);

  const handleFieldMouseDown = (e: React.MouseEvent, field: SignatureField) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDraggingField(field);
    setSelectedField(field.id);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingField || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(x, canvasRect.width - draggingField.width));
    const constrainedY = Math.max(0, Math.min(y, canvasRect.height - draggingField.height));

    onFieldsChange(fields.map(f => 
      f.id === draggingField.id ? { ...f, x: constrainedX, y: constrainedY } : f
    ));
  }, [draggingField, dragOffset, fields, onFieldsChange]);

  const handleMouseUp = useCallback(() => {
    setDraggingField(null);
  }, []);

  const deleteField = (fieldId: string) => {
    onFieldsChange(fields.filter(f => f.id !== fieldId));
    if (selectedField === fieldId) setSelectedField(null);
  };

  const updateFieldRequired = (fieldId: string, required: boolean) => {
    onFieldsChange(fields.map(f => f.id === fieldId ? { ...f, required } : f));
  };

  const updateFieldRecipient = (fieldId: string, recipientId: string) => {
    onFieldsChange(fields.map(f => f.id === fieldId ? { ...f, recipientId } : f));
  };

  const getRecipientColor = (recipientId: string) => {
    return recipients.find(r => r.id === recipientId)?.color || '#666';
  };

  const selectedFieldData = fields.find(f => f.id === selectedField);

  return (
    <div className="flex h-full gap-4">
      {/* Field Palette */}
      <Card className="w-64 flex-shrink-0">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">Field Types</h3>
          
          {/* Recipient Selector */}
          <div className="mb-4">
            <Label className="text-sm text-muted-foreground">Assign fields to</Label>
            <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select recipient" />
              </SelectTrigger>
              <SelectContent>
                {signers.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: r.color }}
                      />
                      {r.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Field Type Buttons */}
          <div className="space-y-2">
            {fieldTypes.map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => addField(type)}
                disabled={!selectedRecipient}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Selected Field Properties */}
          {selectedFieldData && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-medium mb-3">Field Properties</h4>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Assigned to</Label>
                  <Select 
                    value={selectedFieldData.recipientId} 
                    onValueChange={(v) => updateFieldRecipient(selectedFieldData.id, v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {signers.map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: r.color }} />
                            {r.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Required</Label>
                  <Switch 
                    checked={selectedFieldData.required}
                    onCheckedChange={(checked) => updateFieldRequired(selectedFieldData.id, checked)}
                  />
                </div>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                  onClick={() => deleteField(selectedFieldData.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Field
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div 
            ref={canvasRef}
            className="relative bg-muted/30 min-h-[800px]"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedField(null)}
          >
            {/* Placeholder PDF preview */}
            <div className="absolute inset-4 bg-background rounded shadow-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-6xl mb-4">📄</div>
                <p>Document Preview</p>
                <p className="text-sm">Drag fields onto the document</p>
              </div>
            </div>

            {/* Placed Fields */}
            {fields.map(field => {
              const fieldConfig = fieldTypes.find(f => f.type === field.type);
              const Icon = fieldConfig?.icon || Type;
              const color = getRecipientColor(field.recipientId);
              const isSelected = selectedField === field.id;
              const recipient = recipients.find(r => r.id === field.recipientId);

              return (
                <div
                  key={field.id}
                  className={`absolute cursor-move transition-shadow ${
                    isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{
                    left: field.x,
                    top: field.y,
                    width: field.width,
                    height: field.height,
                    backgroundColor: color + '20',
                    border: `2px dashed ${color}`,
                    borderRadius: 4,
                  }}
                  onMouseDown={(e) => handleFieldMouseDown(e, field)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center h-full gap-1 text-xs" style={{ color }}>
                    <Icon className="h-3 w-3" />
                    <span className="truncate">{fieldConfig?.label}</span>
                  </div>
                  
                  {/* Recipient badge */}
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-3 -left-1 text-[10px] px-1 py-0"
                    style={{ backgroundColor: color, color: 'white' }}
                  >
                    {recipient?.name.split(' ')[0]}
                  </Badge>

                  {/* Required indicator */}
                  {field.required && (
                    <span className="absolute -top-1 -right-1 text-destructive text-lg">*</span>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>

      {/* Fields Summary */}
      <Card className="w-56 flex-shrink-0">
        <CardContent className="p-4">
          <h3 className="font-medium mb-4">Placed Fields</h3>
          
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fields placed yet</p>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {signers.map(recipient => {
                  const recipientFields = fields.filter(f => f.recipientId === recipient.id);
                  if (recipientFields.length === 0) return null;

                  return (
                    <div key={recipient.id}>
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: recipient.color }}
                        />
                        <span className="text-sm font-medium">{recipient.name}</span>
                      </div>
                      <div className="space-y-1 pl-5">
                        {recipientFields.map(field => {
                          const fieldConfig = fieldTypes.find(f => f.type === field.type);
                          const Icon = fieldConfig?.icon || Type;
                          
                          return (
                            <div 
                              key={field.id}
                              className={`flex items-center gap-2 text-sm p-1 rounded cursor-pointer hover:bg-muted ${
                                selectedField === field.id ? 'bg-muted' : ''
                              }`}
                              onClick={() => setSelectedField(field.id)}
                            >
                              <Icon className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{fieldConfig?.label}</span>
                              {field.required && <span className="text-destructive">*</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
