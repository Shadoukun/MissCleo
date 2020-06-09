import React, { Component } from 'react';
import { RouteComponentProps, match } from 'react-router-dom';
import { History, Location } from 'history';
import { Typography, Box, LinearProgress, Fade } from '@material-ui/core';
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

type QuoteListType = Array<{}>;

interface MemberList {
  [key: string]: any
};

interface QuotePageParams {
  guild: string
};

type QuoteState = {
  top: number
  loading: boolean

  location: Location<History.PoorMansUnknown>
  history: History<History.PoorMansUnknown>
  match: match<QuotePageParams>

  guild: string
  user: string
  pageCount: number
  currentPage: number
  searchString: string
  displaySearch: string

  quoteList: QuoteListType
  memberList: { [key: string]: any };

};

type MemberEntry = {
  display_name: string
  guild?: string
  guild_id: string
  joined_at: string
  top_role_color: object
  top_role_id: string
  user: object
  user_id: string
};

class QuotePage extends Component<RouteComponentProps<QuotePageParams>, QuoteState> {

  private url = '/quotes';
  private query = new URLSearchParams(this.props.location.search);

  state: QuoteState = {
    top: 0,

    guild: this.props.match.params.guild,
    user: this.query.get("user") || "",

    location: this.props.location,
    history: this.props.history,
    match: this.props.match,
    loading: true,

    quoteList: [],
    memberList: {},
    pageCount: 0,
    currentPage: 1,
    searchString: "",
    displaySearch: "",

  };

  scrollBar = React.createRef<Scrollbars>();

  async fetchMembers() {
    let result = await backendCall.get(`/all_members?guild=${this.state.guild}`)
    let data: MemberList = {};

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
      user: this.query.get("user") || "",
      currentPage: 1,
      searchString: "",
      displaySearch: "",
      loading: true,
    }, this.fetchQuotes)
  }

  handleSearch = (value: string) => {
    this.setState({
      searchString: value,
      currentPage: 1,
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
    let user = new URLSearchParams(this.props.location.search).get("user") || "";
    if (user !== this.state.user) {
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
                    {this.state.displaySearch &&
                      // hide before loading finishes to avoid displaying prematurely
                      <Typography>
                        Search: {this.state.displaySearch}
                      </Typography>
                    }

                    <QuoteSearch
                      searchString={this.state.searchString}
                      onSubmit={this.handleSearch}
                    />
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
