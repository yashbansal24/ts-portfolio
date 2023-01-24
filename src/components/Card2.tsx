import { Card, Col, Text } from "@nextui-org/react";
// import Streamgraph from "./Stomata";

export const Card2 = () => (
  <Card isPressable css={{ w: "100%" }}>
    <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
      <Col>
        <Text size={12} weight="bold" transform="uppercase" color="#ffffffAA">
          My Interests
        </Text>
        <Text h4 color="white">
          Trading & Investing | My Investments
        </Text>
      </Col>
    </Card.Header>
    <Card.Image
      src="card2.jpg"
      width="100%"
      height={340}
      objectFit="cover"
      alt="Card image background"
    />
    {/* <Streamgraph width={'100%'} height={'100%'}/> */}
  </Card>
);
