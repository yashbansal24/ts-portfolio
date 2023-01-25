import { Card, Col, Text } from "@nextui-org/react";

export const Card1 = (props) => (
  <Card isPressable onPress={props.pressMethod}>
    <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
      <Col>
        <Text size={12} weight="bold" transform="uppercase" color="#ffffffAA">
          About Me
        </Text>
        <Text h4 color="white">
          Lead Software Developer | Technical Lead
        </Text>

        <Text h5 color="white">
          Click to know more
        </Text>
      </Col>
    </Card.Header>
    <Card.Image
      src="card1.jpg"
      objectFit="cover"
      width="100%"
      height={340}
      alt="Card image background"
    />
  </Card>
);
