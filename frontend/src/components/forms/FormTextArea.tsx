import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  Typography,
  Box,
} from '@mui/material';

interface FormTextAreaProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
  extends Omit<TextFieldProps, 'name' | 'value' | 'onChange' | 'error' | 'helperText' | 'multiline'> {
  name: TName;
  control: Control<TFieldValues>;
  rules?: any;
  helpText?: string;
  maxLength?: number;
  showCharCount?: boolean;
  minRows?: number;
  maxRows?: number;
}

export const FormTextArea = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  name,
  control,
  rules,
  helpText,
  maxLength,
  showCharCount = false,
  minRows = 3,
  maxRows = 6,
  ...textFieldProps
}: FormTextAreaProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        ...rules,
        ...(maxLength && {
          maxLength: {
            value: maxLength,
            message: `Maximum ${maxLength} characters allowed`,
          },
        }),
      }}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
        const currentLength = (value || '').length;
        const isOverLimit = Boolean(maxLength && currentLength > maxLength);

        return (
          <Box>
            <TextField
              {...textFieldProps}
              inputRef={ref}
              multiline
              minRows={minRows}
              maxRows={maxRows}
              value={value || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                if (!maxLength || newValue.length <= maxLength) {
                  onChange(newValue);
                }
              }}
              onBlur={onBlur}
              error={!!error || isOverLimit}
              helperText={error?.message || helpText}
              InputProps={{
                ...textFieldProps.InputProps,
                ...(showCharCount && {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography
                        variant="caption"
                        color={isOverLimit ? 'error' : 'text.secondary'}
                        sx={{ position: 'absolute', bottom: 8, right: 8 }}
                      >
                        {currentLength}{maxLength ? `/${maxLength}` : ''}
                      </Typography>
                    </InputAdornment>
                  ),
                }),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  alignItems: 'flex-start',
                  paddingBottom: showCharCount ? '20px' : undefined,
                },
                ...textFieldProps.sx,
              }}
            />
          </Box>
        );
      }}
    />
  );
};
