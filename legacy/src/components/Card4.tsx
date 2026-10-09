import { Card, Col, Row, Button, Text } from "@nextui-org/react";

export const Card4 = () => (
  <Card isPressable css={{ w: "100%", h: "400px" }}>
    <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
      <Col>
        <Text size={12} weight="bold" transform="uppercase" color="#ffffffAA">
          Contact
        </Text>
        <Text h3 color="black">
          Reach out to me
        </Text>
      </Col>
    </Card.Header>
    <Card.Body css={{ p: 0 }}>
      <Card.Image
        src="https://nextui.org/images/card-example-6.jpeg"
        width="100%"
        height="100%"
        objectFit="cover"
        alt="Card example background"
      />
    </Card.Body>
    <Card.Footer
      isBlurred
      css={{
        position: "absolute",
        bgBlur: "#ffffff66",
        borderTop: "$borderWeights$light solid rgba(255, 255, 255, 0.2)",
        bottom: 0,
        zIndex: 1,
      }}
    >
      <Row>
        <Col>
          <Text color="#000" size={12}>
            LinkedIn
          </Text>
          {/* <Text color="#000" size={12}>
            Get notified.
          </Text> */}
        </Col>
        <Col>
          <Row justify="flex-end">
            <Button flat auto rounded color="primary" onPress={() => {window.location.href = "https://www.linkedin.com/in/theyashbansal" }}>
              <Text
                css={{ color: "inherit" }}
                size={12}
                weight="bold"
              >
                LinkedIn
              </Text>
            </Button>
          </Row>
        </Col>
      </Row>
    </Card.Footer>
  </Card>
);
