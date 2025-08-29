import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from '@mui/material';

interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface FormRadioGroupProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
  extends Omit<RadioGroupProps, 'name' | 'value' | 'onChange'> {
  name: TName;
  control: Control<TFieldValues>;
  rules?: any;
  label?: string;
  helpText?: string;
  options: RadioOption[];
}

export const FormRadioGroup = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  name,
  control,
  rules,
  label,
  helpText,
  options,
  ...radioGroupProps
}: FormRadioGroupProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
        <FormControl component="fieldset" error={!!error}>
          {label && (
            <FormLabel component="legend">
              {label}
            </FormLabel>
          )}
          <RadioGroup
            {...radioGroupProps}
            ref={ref}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                disabled={option.disabled}
              />
            ))}
          </RadioGroup>
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
