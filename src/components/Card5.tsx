import { Card, Col, Row, Button, Text, Link, Spacer} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import ls from 'localstorage-slim';

export const Card5 = () => {
  const [news, setNews] = useState([]);

  const fetchData = () => {
    return fetch('https://gnews.io/api/v4/search?q=Technology&token=' + "31eefdec89c064e680f8c3418c4387fe" + '&lang=en&country=us&max=10')
          .then((response) => response.json())
          .then((data) => {
            setNews(data.articles.slice(0,2));
            ls.set('news_data', data.articles.slice(0,2), { ttl: 18000 });
      });
  }

  useEffect(() => {    
    if (ls.get('news_data')) {
      setNews(ls.get('news_data'))
    }
    else {
      fetchData();
    }
  },[])
  console.log(news)
  return (
  <Card isPressable css={{ w: "100%", h: "400px" }}>
    <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
      <Col>
        <Text size={12} weight="bold" transform="uppercase" color="blue">
          Latest in Tech
        </Text>
        <Text h3 color="gray">
          Top News and videos
        </Text>
        {(news||[]).map((item,idx) => 
        <React.Fragment key={idx}>
          <Text h4 color="white" style={{'fontStyle': 'underline'}}>
            {item.title}
          </Text>
          <Link isExternal style={{'fontSize': '12px'}} color="warning" href={item.url}>
          {item.source.name}
        </Link>
        <Spacer />
        </React.Fragment>
      )}
      </Col>
    </Card.Header>
    <Card.Body css={{ p: 0 }}>
      <Card.Image
        src="card5.jpg"
        objectFit="cover"
        width="100%"
        height="100%"
        alt="Relaxing app background"
      />
    </Card.Body>
    <Card.Footer
      isBlurred
      css={{
        position: "absolute",
        bgBlur: "#0f111466",
        borderTop: "$borderWeights$light solid $gray800",
        bottom: 0,
        zIndex: 1,
      }}
    >
      <Row>
        <Col>
          <Row>
            <Col span={3}>
              <Card.Image
                src="https://nextui.org/images/breathing-app-icon.jpeg"
                css={{ bg: "black", br: "50%" }}
                height={40}
                width={40}
                alt="Breathing app icon"
              />
            </Col>
            <Col>
              <Text color="#d1d1d1" size={12}>
                Learn New Tech
              </Text>
              <Text color="#d1d1d1" size={12}>
                and the Latest News & Trends.
              </Text>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row justify="flex-end">
            <Button
              flat
              auto
              rounded
              css={{ color: "#94f9f0", bg: "#94f9f026" }}
            >
              <Text
                css={{ color: "inherit" }}
                size={12}
                weight="bold"
                transform="uppercase"
              >
                Stay Updated
              </Text>
            </Button>
          </Row>
        </Col>
      </Row>
    </Card.Footer>
  </Card>
)
}
