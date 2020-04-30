import React, { useState, useEffect } from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import axios from 'axios';
import { IndexLinkContainer } from 'react-router-bootstrap';
import ReactPaginate from 'react-paginate';

const QuotePage = () => {
  const { guildId, userId } = useParams();
  const [guild, setGuild] = useState(guildId);
  const [user, setUser] = useState(userId);

  useEffect(() => {
    setUser(userId);
    setGuild(guildId);
  }, [guildId, userId])

  return (
    <Container>
      <Row>
        <Col md={2}>
          <GuildBar setGuild={setGuild} activeGuildId={guild} />
          {guild && (<MembersBar guildId={guild} activeUserId={user} setUser={setUser} />)}
        </Col>
        <Col md={10}>
          {guild && (<QuoteList guildId={guild} userId={user} />)}
        </Col>
      </Row>
    </Container>
  )
}

const MembersBar = ({ guildId, activeUserId, setUser }) => {

  const [userList, setUserList] = useState([]);

  useEffect(() => {
    (async () => {
      console.log(`/members/${guildId}`)
      let request = await axios(`/members?guild=${guildId}`)
      setUserList(request.data)
    })()
  }, [guildId])

  return (
    <div>
      {userList.map((user) =>
        <Nav variant="pills" activeKey={!!activeUserId ? activeUserId : ""}> {/* activekey activates all elements if param isn't set. cuz why not? */}
          <Nav.Item>
            <IndexLinkContainer to={`/quotes/${guildId}/${user.user_id}`} >
              <Nav.Link eventKey={user.user_id} id={user.user_id} onClick={() => { setUser(user.user_id) }}>
                <div className="avatar">
                  {user.user.avatar_url ? <img src={user.user.avatar_url} /> : <img/>}
                </div>
                <div>{user.display_name}</div>
                </Nav.Link>
            </IndexLinkContainer>
          </Nav.Item>
        </Nav>
      )}
    </div>

  )
}

const QuoteList = ({ guildId, userId }) => {

  const [quoteList, setQuoteList] = useState([]);
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const url = "/quotes"

  useEffect(() => {
    (async () => {
      let params = []

      if (guildId) { params.push(`guild=${guildId}`) }

      if (userId) { params.push(`user=${userId}`) }
      
      if (currentPage >= 1) { params.push(`page=${currentPage}`) }

      let result = await axios(url + `?${params.join('&')}`)
      console.log(result)
      setQuoteList(result.data.quotes)
      setPageCount(result.data.pages)
    })()
  }, [guildId, userId, currentPage])

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1)
  }

  return (
    <div>
      {quoteList.map((quote) =>
        <div className="card">
          <div className="card-header">
            <div className="avatar">
              <img src={quote.user.avatar_url}/>
            </div>
            <div>{quote.member.display_name}</div>
          </div>
          <div className='card-body'>{quote.message}</div>
          <br></br>
        </div>)}

      <ReactPaginate
        containerClassName="pagination"
        breakClassName="page-item"
        breakLabel={<a className="page-link">...</a>}
        pageClassName="page-item"
        previousClassName="page-item"
        nextClassName="page-item"
        pageLinkClassName="page-link"
        previousLinkClassName="page-link"
        nextLinkClassName="page-link"
        activeClassName="active"
        onPageChange={handlePageClick}
      />

    </div>
  )
}

const GuildBar = ({ setGuild, activeGuildId }) => {
  const [guildList, setGuildList] = useState([]);

  useEffect(() => {
    (async () => {
      let request = await axios('/guilds')
      console.log(request.data)
      setGuildList(request.data)
    })()
  }, [])

  return (
    <div>
      {guildList.map((guild) =>
        <Nav variant="pills" activeKey={!!activeGuildId ? activeGuildId : ""}> {/* activekey activates all elements if null */}
          <Nav.Item>
            <IndexLinkContainer to={`/quotes/${guild.id}`} >
              <Nav.Link eventKey={guild.id} id={guild.id} onClick={() => { setGuild(guild.id) }}>
                <div>
                  <img src={guild.icon_url} />
                </div>
                {guild.name}
              </Nav.Link>
            </IndexLinkContainer>
          </Nav.Item>
        </Nav>
      )}
    </div>
  )

}

export default QuotePage;