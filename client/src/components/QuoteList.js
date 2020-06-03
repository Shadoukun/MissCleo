import { lighten, darken } from 'polished';
import { Box } from '@material-ui/core'
import styled from 'styled-components';


export const QuoteList = styled(Box)`
${({ theme }) => `
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  padding: ${theme.spacing(2)}px;
  color: ${theme.colors.primaryFontColor};

  ${theme.breakpoints.up('sm')} {
    margin-left: ${theme.drawerWidth}px;
  }

  .pagination {
    padding-top: 1em;
    padding-bottom: 2em;
    display: inline-flex !important;
    margin: auto;

    .page-item {
      color: white;

        .page-link {
          color: white;
          background: ${theme.colors.backgroundColor};
          border: 1px solid ${theme.colors.secondaryBackground};

          &:active, &:focus, &:hover {
            box-shadow: none !important;
          }
        }

      &.active .page-link {
          color: ${ darken(0.05, theme.colors.primaryFontColor)};
          background: ${ lighten(0.1, theme.colors.backgroundColor)};
      }
    }

    &.active {
      border:
      background: #474a51;
    }
  }
`}`

export default QuoteList
