import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import {
  FormControl,
  
  Select,
  MenuItem,
  FormHelperText,
  InputLabel,
  SelectProps,
  Chip,
  Box,
  OutlinedInput,
} from '@mui/material';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
  extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'error'> {
  name: TName;
  control: Control<TFieldValues>;
  rules?: any;
  label?: string;
  options: SelectOption[];
  helpText?: string;
  placeholder?: string;
  emptyOption?: boolean;
  emptyOptionLabel?: string;
  multiple?: boolean;
}

export const FormSelect = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  name,
  control,
  rules,
  label,
  options,
  helpText,
  placeholder,
  emptyOption = true,
  emptyOptionLabel = 'Select an option...',
  multiple = false,
  ...selectProps
}: FormSelectProps<TFieldValues, TName>) => {
  const renderValue = (selected: any) => {
    if (multiple) {
      if (!selected || selected.length === 0) {
        return placeholder || '';
      }
      
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selected.map((value: string | number) => {
            const option = options.find(opt => opt.value === value);
            return (
              <Chip
                key={value}
                label={option?.label || value}
                size="small"
                variant="outlined"
              />
            );
          })}
        </Box>
      );
    }
    
    if (!selected) {
      return placeholder || '';
    }
    
    const option = options.find(opt => opt.value === selected);
    return option?.label || selected;
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error} variant="outlined">
          {label && (
            <InputLabel id={`${name}-label`}>
              {label}
            </InputLabel>
          )}
          <Select
            {...selectProps}
            labelId={label ? `${name}-label` : undefined}
            inputRef={ref}
            value={value || (multiple ? [] : '')}
            onChange={onChange}
            onBlur={onBlur}
            label={label}
            multiple={multiple}
            displayEmpty={!!placeholder}
            renderValue={renderValue}
            input={multiple ? <OutlinedInput label={label} /> : undefined}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 224,
                  width: 250,
                },
              },
            }}
          >
            {!multiple && emptyOption && (
              <MenuItem value="" disabled>
                <em>{emptyOptionLabel}</em>
              </MenuItem>
            )}
            {options.map((option) => (
              <MenuItem 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error?.message || helpText) && (
            <FormHelperText>
              {error?.message || helpText}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};