import React, { Component } from 'react';
import { RouteComponentProps, match } from 'react-router-dom';
import { History, Location } from 'history';
import { Box, LinearProgress, Fade } from '@material-ui/core';
import { Scrollbars } from 'react-custom-scrollbars';
import ResponsiveDrawer from '../components/Drawer';
import ReactPaginate from 'react-paginate';
import styled from 'styled-components';


import { MemberList } from '../components/QuoteSidebarList';
import QuoteList from '../components/QuoteList';
import { QuoteEntry } from '../components/QuoteEntry';
import QuoteSearch from '../components/QuoteSearch'
import { backendCall } from '../utilities';


const StyledProgress = styled(LinearProgress)`
${({ theme }) => `
  background-color: unset;

  .MuiLinearProgress-barColorPrimary {
    background-color: ${theme.colors.primaryFontColor};
  }
`}`


interface QuotePageParams {
  guild: string
};

type QuoteState = {
  loading: boolean

  location: Location<History.PoorMansUnknown>
  history: History<History.PoorMansUnknown>
  match: match<QuotePageParams>

  guild: string
  user: string
  pageCount: number
  currentPage: number
  searchString: string

  quoteList: QuoteListType
  memberList: MemberListType;
};

type UserEntry = {
  id: string
  name: string
  avatar_url: string
}

type MemberEntry = {
  guild_id: string
  guild?: object
  user_id: string
  user: UserEntry

  display_name: string
  joined_at: string
  top_role: any
  top_role_id: string
};

export type QuoteEntryType = {
  guild_id: string
  channel_id: string
  user_id: string
  guild?: string
  member: MemberEntry
  user: UserEntry

  message_id: string
  message: string
  timestamp: string
  attachments: string[]
}

type QuoteListType = Array<QuoteEntryType>;

export interface MemberListType {
  [key: string]: MemberEntry
};


const getParams = (location: Location<History.PoorMansUnknown>) => {
  return new URLSearchParams(location.search || "")
}


class QuotePage extends Component<RouteComponentProps<QuotePageParams>, QuoteState> {

  private url = '/quotes';

  state: QuoteState = {
    guild: this.props.match.params.guild,
    user: getParams(this.props.location).get("user") || "",

    location: this.props.location,
    history: this.props.history,
    match: this.props.match,

    quoteList: [],
    memberList: {},
    pageCount: 0,
    currentPage: 1,
    searchString: "",

    loading: true,

  };

  scrollBar = React.createRef<Scrollbars>();

  async fetchMembers() {
    let result = await backendCall.get(`/all_members?guild=${this.state.guild}`)
    let data: MemberListType = {};

    result.data.forEach((m: MemberEntry) => {
      data[m.user_id] = m
    });
    this.setState({
      memberList: data
    });
  };

  async fetchQuotes() {
    let params = []
    console.log(this.state.user)

    // compile parameters for API from current state.
    if (this.state.guild) {
      params.push(`guild=${this.state.guild}`)
    };

    if (this.state.user && !this.state.searchString) {
      params.push(`user=${this.state.user}`)
    };

    if (this.state.searchString) {
      params.push(`search=${encodeURIComponent(this.state.searchString)}`)
    };
    if (this.state.currentPage) {
      params.push(`page=${this.state.currentPage}`)
    };

    let result = await backendCall.get(this.url + `?${params.join('&')}`);

    this.setState({
      quoteList: result.data.quotes,
      pageCount: result.data.pages,
      loading: false
    });

  };

  resetPage() {
    this.setState({
      user: "",
      currentPage: 1,
      searchString: "",
      loading: true,
    }, this.fetchQuotes)
  }

  handleSearch = (value: string) => {
    this.setState({
      currentPage: 1,
      searchString: value,
      loading: true
    }, this.fetchQuotes);
  };

  handlePageChange = (selectedPage: number) => {
    this.setState({
      currentPage: selectedPage,
      loading: true
    }, this.fetchQuotes);
  };


  componentDidMount() {
    this.fetchMembers()
      .then(() => {
        (async () => {
          await this.fetchQuotes();
        })()
      });
  };


  componentDidUpdate(prevProps: RouteComponentProps<QuotePageParams>, prevState: QuoteState) {

    // check if user changed
    let user = getParams(this.props.location).get("user")
    if (user && user !== this.state.user) {
      this.scrollBar.current?.scrollToTop()
      this.setState({
        user: user,
        currentPage: 1,
        searchString: "",
        loading: true,
      }, this.fetchQuotes)
      return true
    }

    // check if Location updated without changing routes. (Navbar button clicked)
    if (prevProps.location.key !== this.props.location.key && prevProps.location.pathname === this.state.location.pathname) {
      this.scrollBar.current?.scrollToTop()
      this.resetPage()
      return true
    };

  };



  componentWillUnmount() { };

  render() {
    this.scrollBar.current?.scrollToTop()

    return (
      <Box display="flex" style={{ height: "calc(100vh - 64px)" }}>
        <Scrollbars ref={this.scrollBar} {...this.props}>
          <Box style={{ flexGrow: 1 }} >
            <Box style={{ display: this.state.loading ? "block" : "none" }}>
              <StyledProgress color="primary" variant="query" />
            </Box>

            <ResponsiveDrawer>
              {this.state.memberList &&
                <MemberList
                  guildId={this.state.guild}
                  userId={this.state.user}
                />
              }
            </ResponsiveDrawer>

            <QuoteList>

              <Fade in={!this.state.loading}>
                <Box>
                  <Box className="quote-list-header" display="flex">
                    <Box display="flex" flexDirection="row" ml="auto">
                      <QuoteSearch
                        searchString={this.state.searchString}
                        onSubmit={this.handleSearch}
                        resetPage={() => this.resetPage()}
                      />
                    </Box>
                  </Box>

                  {this.state.quoteList.map((quote, i) =>
                    <QuoteEntry
                      key={i}
                      quote={quote}
                      memberList={this.state.memberList}
                    />
                  )}


                  <Box display="flex" m={"auto"}>
                    <ReactPaginate
                      containerClassName="pagination"
                      breakClassName="page-item"
                      breakLabel={<button className="page-link">...</button>}
                      previousLabel="<"
                      nextLabel=">"
                      pageCount={this.state.pageCount}
                      forcePage={this.state.currentPage - 1}
                      pageClassName="page-item"
                      previousClassName="page-item"
                      nextClassName="page-item"
                      pageLinkClassName="page-link"
                      previousLinkClassName="page-link"
                      nextLinkClassName="page-link"
                      activeClassName="active"
                      pageRangeDisplayed={5}
                      marginPagesDisplayed={3}
                      onPageChange={(p) => this.handlePageChange(p.selected + 1)}
                    />
                  </Box>
                </Box>
              </Fade>
            </QuoteList>
          </Box>
        </Scrollbars>
      </Box>
    );
  };
};

export default QuotePage;
