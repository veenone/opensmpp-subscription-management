import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import {
  TextField,
  TextFieldProps,
} from '@mui/material';

interface FormDatePickerProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
  extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'error' | 'helperText' | 'type'> {
  name: TName;
  control: Control<TFieldValues>;
  rules?: any;
  helpText?: string;
  dateType?: 'date' | 'datetime-local' | 'time';
}

export const FormDatePicker = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  name,
  control,
  rules,
  helpText,
  dateType = 'date',
  ...textFieldProps
}: FormDatePickerProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
        // Format the value for the input
        let formattedValue = value || '';
        if (value && typeof value === 'string') {
          // If it's a date string, format it for the input type
          if (dateType === 'date') {
            formattedValue = value.split('T')[0]; // Extract date part
          } else if (dateType === 'datetime-local') {
            // Convert to local datetime format
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              formattedValue = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
            }
          }
        }

        return (
          <TextField
            {...textFieldProps}
            inputRef={ref}
            type={dateType}
            value={formattedValue}
            onChange={(e) => {
              const inputValue = e.target.value;
              if (dateType === 'datetime-local' && inputValue) {
                // Convert back to ISO string
                const date = new Date(inputValue);
                onChange(date.toISOString());
              } else {
                onChange(inputValue);
              }
            }}
            onBlur={onBlur}
            error={!!error}
            helperText={error?.message || helpText}
            InputLabelProps={{
              shrink: true,
              ...textFieldProps.InputLabelProps,
            }}
          />
        );
      }}
    />
  );
};