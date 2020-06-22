import React, { useState, useEffect } from 'react';
import { Typography, Avatar, Box } from '@material-ui/core';
import { darken } from 'polished';
import styled from 'styled-components';

import { MemberEntry, Role } from '../../../types';
import { useGuildContext } from '../../../context/Guild';
import VirtualizedAutoComplete from '../../autocomplete-virtualized';
import { rgbToHex } from '../../../utilities';


type RoleFilterProps = {
  roleFilter: string[]
  setRoleFilter: (newValue: string[]) => any
}

const RoleFilterInput: React.FC<RoleFilterProps> = ({ roleFilter, setRoleFilter }) => {
  // array of selected objects
  const [value, setValue] = useState<Role[]>([]);
  const [roleList, setRoleList] = useState<Role[]>();
  const [roleIds, setRoleIds] = useState<any>();
  const { roleList: roleDict } = useGuildContext();

  useEffect(() => {
    if (roleDict !== undefined) {
      // convert MemberListType dict to MemberEntry[]
      let roles: Role[] = Object.keys(roleDict).map((key, i) => roleDict[key])

      // convert string[] of user ids to MemberEntry[]
      let filterValue = roleFilter.map((key, i) => roleDict[key])

      setRoleList(roles)
      setRoleIds(Object.keys(roleDict))
      setValue(filterValue)
    }
  }, [roleDict])

  // set userFilter to an array of user ids from `value`
  useEffect(() => {
    if (roleDict !== undefined) {
      // value: MemberEntry[] => newFilterValue: string[]
      let newFilterValue = value.filter(r => roleIds.includes(r.id))
        .reduce((roles: string[], r: Role) => {
          roles.push(r.id)
          return roles
        }, [])

      setRoleFilter(newFilterValue)
    }
  }, [value])

  if (roleList) {
    return (
      <VirtualizedAutoComplete<Role>
        label="Role Filter"
        hideEmpty
        options={roleList}
        value={value}
        setValue={setValue}
        getOptionLabel={(r) => r.name}
        getOptionSelected={(r, v) => r.name === v.name}
        renderOption={(r) => (
          <Typography className="role" noWrap style={{color: rgbToHex(r.color) }}>
            {r.name}
          </Typography>
        )}
      />
    );
  } else {
    return (
      <>
      </>
    )
  }
}


export default RoleFilterInput
