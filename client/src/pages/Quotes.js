import React, { useState, useEffect } from 'react';
import { Container, Col, Row, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Nav, ButtonToolbar } from 'react-bootstrap';
import { IndexLinkContainer } from 'react-router-bootstrap';
import ReactPaginate from 'react-paginate';
import Copy from 'copy-to-clipboard';
import { backendCall } from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'

import {
  QuoteMain,
  QuoteSideBar,
  QuoteSideBarSection,
  QuoteSideBarNavLink,
  QuoteCard,
  QuoteDropdown as Dropdown,
  CustomToggle,
  PaginationWrapper
} from '../components/QuoteComponents';


const rgbToHex = (rgb) => {
  let hex = Number(rgb).toString(16);
  return hex.length === 6 ? ("#" + hex) : ("#ffffff")
};

const QuotePage = () => {
  const { guildId, userId } = useParams();
  const [guild, setGuild] = useState();
  const [user, setUser] = useState();

  useEffect(() => {
    setUser(userId);
    setGuild(guildId);
  }, [guildId, userId])

  return (
    <Container fluid style={{ paddingLeft: "0px" }}>
      <Row>
        <Col md={3}>
          <QuoteSideBar className="sidebar">
            <GuildBar setGuild={setGuild} activeGuildId={guild} />
            {guild && (<MembersBar guildId={guild} activeUserId={user} setUser={setUser} />)}
          </QuoteSideBar>
        </Col>
        <Col md={9}>
          {guild && (<QuoteList guildId={guild} userId={user} />)}
        </Col>

      </Row>
    </Container>
  )
}

const GuildBar = ({ setGuild, activeGuildId }) => {
  const [guildList, setGuildList] = useState([]);

  useEffect(() => {
    (async () => {
      let request = await backendCall.get('/guilds')
      setGuildList(request.data)
    })()
  }, [])

  return (
    <QuoteSideBarSection className="quotes-sidebar-section">
      <h1>Servers</h1>
      {/* activekey activates all elements if null */}
      <Nav variant="pills" activeKey={!!activeGuildId ? activeGuildId : ""} >

        {guildList.map((guild, i) =>
          <Nav.Item key={i} className="quote-sidebar-nav">
            <IndexLinkContainer to={`/quotes/${guild.id}`} >
              <QuoteSideBarNavLink eventKey={guild.id} id={guild.id} onClick={() => { setGuild(guild.id) }} >
                <img className="avatar" src={guild.icon_url} alt="" />
                <div className="name">
                  {guild.name}
                </div>
              </QuoteSideBarNavLink>
            </IndexLinkContainer>
          </Nav.Item>
        )}

      </Nav>
    </QuoteSideBarSection>
  )

}


const MembersBar = ({ guildId, activeUserId, setUser }) => {

  const [userList, setUserList] = useState([]);

  useEffect(() => {
    (async () => {
      let request = await backendCall.get(`/members?guild=${guildId}`)
      setUserList(request.data)
    })()
  }, [guildId])

  return (
    <QuoteSideBarSection className="quotes-sidebar-section">
      <h1>Users</h1>
      {/* activekey activates all elements if param isn't set. cuz why not? */}
      <Nav className="quote-sidebar-nav" variant="pills" activeKey={!!activeUserId ? activeUserId : ""}>

        {userList.map((user, i) =>
          <Nav.Item key={i} className='quote-sidebar-entry'>
            <IndexLinkContainer to={`/quotes/${guildId}/${user.user_id}`} >
              <QuoteSideBarNavLink className="quote-sidebar-link" eventKey={user.user_id} id={user.user_id} onClick={() => { setUser(user.user_id) }}>
                <img className="avatar" src={user.user.avatar_url} alt="" />
                <div className="name" style={{ color: (rgbToHex(user.top_role.color)) }}>
                  {user.display_name}
                </div>
              </QuoteSideBarNavLink>
            </IndexLinkContainer>
          </Nav.Item>
        )}

      </Nav>
    </QuoteSideBarSection>

  )
}

const QuoteList = ({ guildId, userId }) => {

  const [quoteList, setQuoteList] = useState([]);
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const url = "/quotes"

  // reset currentPage when userId changes.
  useEffect(() => {
    setCurrentPage(1)
  }, [guildId, userId])

  useEffect(() => {
    (async () => {
      let params = []

      if (guildId) { params.push(`guild=${guildId}`) }
      if (userId) { params.push(`user=${userId}`) }
      if (currentPage) { params.push(`page=${currentPage}`) }

      let result = await backendCall.get(url + `?${params.join('&')}`)
      setQuoteList(result.data.quotes)
      setPageCount(result.data.pages)
    })()
  }, [guildId, userId, currentPage])

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1)
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <QuoteMain className="quote-list">
      {quoteList.map((quote, i) =>
        <QuoteCard key={i} className="quote-card card">
          <div className="quote-header">
            <img src={quote.user.avatar_url} alt="" />
            <div className="wrapper">
              <div className="name" style={{ color: rgbToHex(quote.member.top_role.color) }}>
                {quote.member.display_name}
              </div>
              <div className="timestamp text-muted">{quote.timestamp}</div>
            </div>
              <QuoteDropdown quote={quote} />
          </div>
          <div className='quote-body'>
            {quote.message}
          </div>
        </QuoteCard>
      )}

      <PaginationWrapper>
        <ReactPaginate className="pagination"
          containerClassName="pagination"
          breakClassName="page-item"
          breakLabel={<button className="page-link">...</button>}
          previousLabel="<"
          nextLabel=">"
          pageCount={pageCount}
          forcePage={currentPage - 1}
          pageClassName="page-item"
          previousClassName="page-item"
          nextClassName="page-item"
          pageLinkClassName="page-link"
          previousLinkClassName="page-link"
          nextLinkClassName="page-link"
          activeClassName="active"
          onPageChange={handlePageClick}
        />
      </PaginationWrapper>

    </QuoteMain>
  )
}


const QuoteDropdown = ({quote}) => {
  const [quoteId, setQuoteId] = useState(quote.message_id)

  useEffect(() => {
    setQuoteId(quote.message_id)
  }, [quote])

  const handleClick = () => {
    Copy(quoteId)
  }

  return (
      <Dropdown
        id="quote_dropdown"
        rootCloseEvent="mousedown"
      >
        <Dropdown.Toggle as={CustomToggle}><FontAwesomeIcon icon={faCaretDown} /></Dropdown.Toggle>
        <Dropdown.Menu className="quote_dropdown_menu">
          <Dropdown.Item eventKey="1" onClick={handleClick}>Copy Quote ID</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
  )
}

export default QuotePage;
