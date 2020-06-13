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
import { QuoteListType, MemberListType, MemberEntry } from '../types';


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

type QuoteLocationState = {
  navPressed?: boolean
}



const getParams = (location: Location<History.PoorMansUnknown>) => {
  return new URLSearchParams(location.search || "")
}


class QuotePage extends Component<RouteComponentProps<QuotePageParams, any, QuoteLocationState>, QuoteState> {

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

    this.scrollBar.current?.scrollToTop()

    this.setState({
      quoteList: result.data.quotes,
      pageCount: result.data.pages,
    });
    setTimeout(() => {
      this.setState({
        loading: false
      })
    }, 250)
  };


  resetPage() {
    this.setState({
      user: "",
      currentPage: 1,
      searchString: "",
      loading: true,
    }, this.fetchQuotes)
  }

  switchUser(newUser: string) {
    this.scrollBar.current?.scrollToTop()
    this.setState({
      user: newUser,
      currentPage: 1,
      searchString: "",
      loading: true,
    }, this.fetchQuotes)
  }

  handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let newSearch = (event.currentTarget[0] as HTMLInputElement).value
    if (this.state.user) {
      this.props.history.replace({ ...this.props.location, search: "" })
    }
    this.setState({
      currentPage: 1,
      searchString: newSearch,
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
      this.switchUser(user)
      return true
    }

    // check if nav Link was pressed again.
    if (this.props.location.state?.navPressed) {
      this.props.history.replace({
        ...this.props.location,
        state: {}
      })
      this.resetPage()
      return true
    }
  };

  render() {

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

                    <QuoteSearch
                      searchString={this.state.searchString}
                      onSubmit={this.handleSearch}
                      onReset={() => this.resetPage()}
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
