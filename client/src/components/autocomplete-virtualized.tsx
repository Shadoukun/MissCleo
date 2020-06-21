import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteRenderInputParams, } from '@material-ui/lab/Autocomplete';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ListSubheader from '@material-ui/core/ListSubheader';
import { useTheme } from '@material-ui/core/styles';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { lighten, darken } from 'polished';
import styled from 'styled-components';
import { FormLabel } from './Form';

const LISTBOX_PADDING = 4; // px

type RenderInputParams = AutocompleteRenderInputParams;
type ListboxComponentType = React.ComponentType<React.HTMLAttributes<HTMLElement>>


const ListBoxWrapper = styled.div`
${({ theme }) => `
  background-color: ${theme.colors.backgroundColor};
  color: ${theme.colors.primaryFontColor};

`}`

const StyledAutocomplete = styled(Autocomplete) <any>`
${({ theme }) => `
    border-radius: 4px;
    position: relative;
    border: 1px solid ${darken(0.025, theme.colors.secondaryBackground)};
    font-size: 16px;
    transition: ${theme.transitions.create(['background-color', 'border-color', 'box-shadow'])};

    .MuiAutocomplete-inputRoot[class*="MuiFilledInput-root"] {
      padding-top: unset;
      border-radius: 4px;
      background-color ${theme.colors.backgroundColor};

    }

    &.Mui-focused .MuiAutocomplete-inputRoot[class*="MuiFilledInput-root"] {
      background-color: ${lighten(0.05, theme.colors.backgroundColor)};
      border-color: ${theme.colors.secondaryBackground}
    }

    .MuiAutocomplete-tag {
      color: ${theme.colors.primaryFontColor};
      background-color: ${theme.colors.secondaryBackground};
      border-radius: 4px;
    }

    .listbox {
      box-sizing: border-box;
    }

    ul {
      padding: 0;
      margin: 0;
    }
`}`

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  return React.cloneElement(data[index], {
    style: {
      ...style,
      top: (style.top as number) + LISTBOX_PADDING,
    },
  });
}

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div className="outer-element" ref={ref} {...props} {...outerProps} />;
});


// Adapter component for react-window
const ListboxComponent = React.forwardRef<HTMLDivElement>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
  const itemCount = itemData.length;
  const itemSize = smUp ? 48 : 56;

  const getChildSize = (child: React.ReactNode) => {
    if (React.isValidElement(child) && child.type === ListSubheader) {
      return 48;
    }
    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <ListBoxWrapper ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index: any) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </ListBoxWrapper>
  );
});


const AutocompleteInput: React.FC<RenderInputParams> = (params) => (
  <TextField
    {...params}
    type="search"
    variant="filled"
    fullWidth
    InputProps={{
      ...params.InputProps,
      disableUnderline: true
    }}
  />
);

type VirtAutoCompleteProps<T> = {
  label: string // form label
  options: T[] // array of possible objects
  value: T[] // array of selected objects
  hideEmpty?: boolean
  setValue: React.Dispatch<T[]>
  getOptionLabel: (option: T) => string
  getOptionSelected: (option: T, value: T) => boolean
  renderOption: (option: T) => React.ReactNode
};

function VirtualizedAutoComplete<T>({
  label,
  value,
  setValue,
  getOptionLabel,
  getOptionSelected,
  renderOption,
  ...props
}: VirtAutoCompleteProps<T>) {
  const [open, setOpen] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>("");


  const onChange = (event: React.ChangeEvent, newValue: T[]) => {
    setValue(newValue);
  }

  const onInputChange = (event: React.ChangeEvent, newInputValue: string) => {
    // if hideEmpty is defined, don't show the popper when input is empty.
    if (props.hideEmpty) {
      if (newInputValue.length > 0) {
        setOpen(true)
      } else {
        setOpen(false)
      }
      setInputValue(newInputValue)
    }
  }

  return (
    <>
      <FormLabel>{label}</FormLabel>

      <StyledAutocomplete
        id="user-filter-autocomplete"
        multiple
        open={open}
        freeSolo
        autoHighlight
        value={value}
        onChange={onChange}
        inputValue={inputValue}
        onInputChange={onInputChange}
        style={{ width: "100%" }}
        disableListWrap
        ListboxComponent={ListboxComponent as ListboxComponentType}
        options={props.options}
        getOptionLabel={getOptionLabel}
        getOptionSelected={getOptionSelected}
        renderInput={AutocompleteInput}
        renderOption={renderOption}
      />
    </>
  );
};

export default VirtualizedAutoComplete
