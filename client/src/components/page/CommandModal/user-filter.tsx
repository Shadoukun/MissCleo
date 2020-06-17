import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteRenderInputParams, } from '@material-ui/lab/Autocomplete';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ListSubheader from '@material-ui/core/ListSubheader';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { Typography, Avatar, Box } from '@material-ui/core';
import { MemberEntry } from '../../../types';
import { useGuildContext } from '../../../context/Guild';
import styled from 'styled-components';
import { FormLabel } from '../../Form';
import { lighten, darken } from 'polished';

const LISTBOX_PADDING = 4; // px

type RenderInputParams = AutocompleteRenderInputParams;
type ListboxComponentType = React.ComponentType<React.HTMLAttributes<HTMLElement>>

type UserFilterType = string[]


const StyledVariableListWrapper = styled.div`
${({ theme }) => `
  background-color: ${theme.colors.backgroundColor};
  color: ${theme.colors.primaryFontColor};

`}`

const StyledOption = styled(Box)`
${({ theme }) => `
  display: flex;
  align-items: center;

  .MuiAvatar-root {
    height: 32px;
    width: 32px;
    margin-right: ${theme.spacing(1)}px;
  }


  .display-name {
    margin-right: ${theme.spacing(1)}px;
  }
  .username {
    font-size: 12px;
    color: ${darken(0.2, theme.colors.primaryFontColor)};
  }

  .display-name, .username {
    color: ${theme.colors.primaryFontColor};
  }
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
      background-color: ${theme.colors.secondaryBackground  };
      border-radius: 4px;
    }

`}`

const useStyles = makeStyles({
  listbox: {
    boxSizing: 'border-box',
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
});

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
    <StyledVariableListWrapper ref={ref}>
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
    </StyledVariableListWrapper>
  );
});


const AutocompleteInput = (params: RenderInputParams) => (
  <TextField
    {...params}
    type="search"
    variant="filled"
    InputProps={{ ...params.InputProps, disableUnderline: true }}
  />
)

const AutoCompleteOption = ({ member }: { member: MemberEntry }) => (
  <StyledOption>
    <Avatar src={member.user.avatar_url} />
    <Typography className="display-name" noWrap>{member.display_name}</Typography>
    <Typography className="username" noWrap>{member.user.name}</Typography>

  </StyledOption>
)


type UserFilterInputProps = {
  userFilter: UserFilterType
  setUserFilter: (newValue: UserFilterType) => any
}

const VirtualizedUserFilterInput: React.FC<UserFilterInputProps> = ({ userFilter, setUserFilter }) => {
  const classes = useStyles();

  const [open, setOpen] = useState<boolean>(false)
  // array of selected objects
  const [value, setValue] = useState<MemberEntry[]>([]);
  // value of the underlying input element
  const [inputValue, setInputValue] = useState<string>("");

  const [userList, setUserList] = useState<MemberEntry[]>();
  const [userIds, setUserIds] = useState<any>();
  const { memberList } = useGuildContext();

  // wait for memberList to populate
  useEffect(() => {
    if (memberList === undefined) {
      return
    }
    // MemberListType => MemberEntry[]
    let members: MemberEntry[] = Object.keys(memberList).map((key, i) => memberList[key])

    // userFilter: string[] => MemberEntry[]
    let filterValue = userFilter.map((key, i) => memberList[key])

    setUserList(members)
    setUserIds(Object.keys(memberList))
    setValue(filterValue)
  }, [memberList])

  // set userFilter to an array of user ids from `value`
  useEffect(() => {
    if (memberList === undefined) {
      return
    }
    // value: MemberEntry[] => newFilterValue: string[]
    let newFilterValue: UserFilterType = value.filter(
      member => userIds.includes(member.user_id)).reduce((members: any, m: any) => {
        members.push(m.user_id)
        return members
      }, [] as UserFilterType)

    setUserFilter(newFilterValue)
  }, [value])


  const onChange = (event: React.ChangeEvent, newValue: MemberEntry[]) => {
    setValue(newValue);
  }

  const onInputChange = (event: React.ChangeEvent, newInputValue: string) => {
    // open when the user begins typing
    // and value isn't empty.
    if (newInputValue.length > 0) {
      setOpen(true)
    } else {
      setOpen(false)
    }
    setInputValue(newInputValue)
  }

  if (userList) {
    return (
      <>
        <FormLabel>User Filter</FormLabel>

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
          classes={classes}
          ListboxComponent={ListboxComponent as ListboxComponentType}
          options={userList}
          getOptionLabel={(member: MemberEntry) => `${member.display_name} (${member.user.name})`}
          getOptionSelected={(member: MemberEntry, value: any) => member.display_name === value.display_name}
          renderInput={AutocompleteInput}
          renderOption={(member: MemberEntry) => (<AutoCompleteOption member={member} />)}
        />
      </>
    );
  } else {
    return (
      <>
      </>
    )
  }
}

export default VirtualizedUserFilterInput
