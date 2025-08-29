import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import {
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Checkbox,
  CheckboxProps,
  Switch,
  SwitchProps,
} from '@mui/material';

interface CheckboxOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface FormCheckboxProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
  extends Omit<CheckboxProps, 'name' | 'value' | 'onChange' | 'checked'> {
  name: TName;
  control: Control<TFieldValues>;
  rules?: any;
  label?: string;
  helpText?: string;
  variant?: 'checkbox' | 'switch';
}

interface FormCheckboxGroupProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> {
  name: TName;
  control: Control<TFieldValues>;
  rules?: any;
  label?: string;
  helpText?: string;
  options: CheckboxOption[];
  row?: boolean;
}

export const FormCheckbox = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  name,
  control,
  rules,
  label,
  helpText,
  variant = 'checkbox',
  ...checkboxProps
}: FormCheckboxProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
        <FormControl error={!!error}>
          <FormControlLabel
            control={
              variant === 'switch' ? (
                <Switch
                  {...(checkboxProps as SwitchProps)}
                  inputRef={ref}
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                />
              ) : (
                <Checkbox
                  {...checkboxProps}
                  inputRef={ref}
                  checked={!!value}
                  onChange={(e) => onChange(e.target.checked)}
                />
              )
            }
            label={label}
          />
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

export const FormCheckboxGroup = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  name,
  control,
  rules,
  label,
  helpText,
  options,
  row = false,
}: FormCheckboxGroupProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedValues: (string | number)[] = value || [];

        const handleChange = (optionValue: string | number, checked: boolean) => {
          let newValues: (string | number)[];
          if (checked) {
            newValues = [...selectedValues, optionValue];
          } else {
            newValues = selectedValues.filter((v: string | number) => v !== optionValue);
          }
          onChange(newValues);
        };

        return (
          <FormControl component="fieldset" error={!!error}>
            {label && <FormLabel component="legend">{label}</FormLabel>}
            <FormGroup row={row}>
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={selectedValues.includes(option.value)}
                      onChange={(e) => handleChange(option.value, e.target.checked)}
                      disabled={option.disabled}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
            {(error?.message || helpText) && (
              <FormHelperText>
                {error?.message || helpText}
              </FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};
