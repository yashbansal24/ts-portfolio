import { Container, Grid,Image } from "@nextui-org/react";
import { Modal, useModal} from "@nextui-org/react";

import React from "react";
import { Card1 } from './components/Card1';
import { Card2 } from './components/Card2';
import { Card3 } from './components/Card3';
import { Card4 } from './components/Card4';
import { Card5 } from './components/Card5';
import Experience from './Experience';
import Portfolio from './components/Portfolio';
import Navigation from './components/navigation'
import Marquee from "react-fast-marquee";

export default function App() {
  const { setVisible, bindings } = useModal();
  const [ portfolioVisible, setPortolioVisible] = React.useState(false);
  const collapseItems = [
    "Profile",
    "Dashboard",
    "Activity",
    "Analytics",
    "System",
    "Deployments",
    "My Settings",
    "Team Settings",
    "Help & Feedback",
    "Log Out",
  ];
  return (
    <React.Fragment>
    <Experience setVisible={setVisible} bindings={bindings}></Experience>
    <Portfolio isOpen={portfolioVisible} setVisible={setPortolioVisible}></Portfolio>
    <Navigation />
      <Container style={{'maxWidth': '1080px', 'margin': '0 auto'}}>
        <Grid.Container gap={2} justify="center" style={{'maxWidth': '1080px'}}>
          <Grid xs={12} sm={4}>
            <Card1 pressMethod={() => setVisible(true)} />
          </Grid>
          <Grid xs={12} sm={4}>
            <Card2 />
          </Grid>
          <Grid xs={12} sm={4}>
            <Card3 pressMethod={() => setPortolioVisible(!portfolioVisible)}/>
          </Grid>
          <Marquee style={{'background': 'orange', 'borderRadius': '15px'}} gradient={false} gradientWidth={'100%'} gradientColor={[221,187,255]}>
            <Image
              width={50}
              src="h1_logo.png"
              alt="H1 logo"
            />
            <Image
              width={100}
              src="deel_logo.png"
              alt="Deel"
            />
            <Image
              width={100}
              src="dataloop.png"
              alt="H1 logo"
            />
            <Image
              width={80}
              src="envirospark-logo-site.webp"
              alt="H1 logo"
            />
            <Image
              width={40}
              src="google_logo.png"
              alt="Google logo"
            />
            <Image
              width={120}  
              src="paypal_logo.webp"
              alt="PayPal logo"
            />
            <Image
              width={100}
              style={{'background': 'white'}}
              src="ekster.png"
              alt="Ekster logo"
            />
            <Image
              width={100}
              src="petasense.png"
              alt="Ekster logo"
            />
            <Image
              width={100}
              src="trading_economics.png"
              alt="Trading Economics"
            />
          </Marquee>
          <Grid xs={12} sm={5}>
            <Card4 />
          </Grid>
          <Grid xs={12} sm={7}>
            <Card5 />
          </Grid>
        </Grid.Container>
      </Container>
      {/* <Window></Window> */}
    </React.Fragment>
  );
}