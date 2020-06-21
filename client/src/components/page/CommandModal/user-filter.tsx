import React, { useState, useEffect } from 'react';
import { Typography, Avatar, Box } from '@material-ui/core';
import { darken } from 'polished';
import styled from 'styled-components';

import { MemberEntry } from '../../../types';
import { useGuildContext } from '../../../context/Guild';
import VirtualizedAutoComplete from '../../autocomplete-virtualized';


const UserOptionWrapper = styled(Box)`
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


const UserFilterOption = ({ member }: { member: MemberEntry }) => (
  <UserOptionWrapper>
    <Avatar src={member.user.avatar_url} />

    <Typography className="display-name" noWrap>
      {member.display_name}
    </Typography>

    <Typography className="username" noWrap>
      {member.user.name}#{member.user.discriminator}
    </Typography>
  </UserOptionWrapper>
)


type UserFilterProps = {
  userFilter: string[]
  setUserFilter: (newValue: string[]) => any
}

const UserFilterInput: React.FC<UserFilterProps> = ({ userFilter, setUserFilter }) => {
  // array of selected objects
  const [value, setValue] = useState<MemberEntry[]>([]);
  const [userList, setUserList] = useState<MemberEntry[]>();
  const [userIds, setUserIds] = useState<any>();
  const { memberList } = useGuildContext();

  useEffect(() => {
    if (memberList !== undefined) {
      // convert MemberListType dict to MemberEntry[]
      let members: MemberEntry[] = Object.keys(memberList).map((key, i) => memberList[key])

      // convert string[] of user ids to MemberEntry[]
      let filterValue = userFilter.map((key, i) => memberList[key])

      setUserList(members)
      setUserIds(Object.keys(memberList))
      setValue(filterValue)
    }
  }, [memberList])

  // set userFilter to an array of user ids from `value`
  useEffect(() => {
    if (memberList !== undefined) {
      // value: MemberEntry[] => newFilterValue: string[]
      let newFilterValue = value.filter(member => userIds.includes(member.user_id))
        .reduce((members: string[], m: MemberEntry) => {
          members.push(m.user_id)
          return members
        }, [])

      setUserFilter(newFilterValue)
    }
  }, [value])

  if (userList) {
    return (
      <VirtualizedAutoComplete<MemberEntry>
        label="User Filter"
        hideEmpty
        options={userList}
        value={value}
        setValue={setValue}
        getOptionLabel={(m) => `${m.display_name} (${m.user.name}#${m.user.discriminator})`}
        getOptionSelected={(m, v) => m.display_name === v.display_name}
        renderOption={(m) => (<UserFilterOption member={m} />)}
      />
    );
  } else {
    return (
      <>
      </>
    )
  }
}


export default UserFilterInput
