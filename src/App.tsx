import { Container, Grid, Navbar, Dropdown, Text, Button, Link,Image } from "@nextui-org/react";
import { Modal, useModal} from "@nextui-org/react";

import React from "react";
import { Card1 } from './components/Card1';
import { Card2 } from './components/Card2';
import { Card3 } from './components/Card3';
import { Card4 } from './components/Card4';
import { Card5 } from './components/Card5';
import Experience from './Experience';
import { icons } from "./icons";
import { AcmeLogo } from "./Acme";
import Window from './components/window'
import Marquee from "react-fast-marquee";
import Projects from "./projects";

export default function App() {
  const { setVisible, bindings } = useModal();
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
    <Experience bindings={bindings}></Experience>
    <Projects bindings={bindings}></Projects>
    <Navbar isBordered variant="sticky">
        <Navbar.Brand>
        <AcmeLogo />
          <Text b color="inherit" hideIn="xs">
            Yash Bansal
          </Text>
        </Navbar.Brand>
        <Navbar.Content
          enableCursorHighlight
          activeColor="secondary"
          hideIn="xs"
          variant="underline"
        >
          <Dropdown isBordered>
            <Navbar.Item>
              <Dropdown.Button
                auto
                light
                css={{
                  px: 0,
                  dflex: "center",
                  svg: { pe: "none" },
                }}
                iconRight={icons.chevron}
                ripple={false}
              >
                Skillset
              </Dropdown.Button>
            </Navbar.Item>
            <Dropdown.Menu
              aria-label="ACME features"
              css={{
                $$dropdownMenuWidth: "340px",
                $$dropdownItemHeight: "70px",
                "& .nextui-dropdown-item": {
                  py: "$4",
                  // dropdown item left icon
                  svg: {
                    color: "$secondary",
                    mr: "$4",
                  },
                  // dropdown item title
                  "& .nextui-dropdown-item-content": {
                    w: "100%",
                    fontWeight: "$semibold",
                  },
                },
              }}
            >
              <Dropdown.Item
                key="Languages & Technologies"
                showFullDescription
                description="Javascript, Typescript, Python, Java, C++, C"
                icon={icons.scale}
              >
                Languages
              </Dropdown.Item>
              <Dropdown.Item
                key="Frameworks"
                showFullDescription
                description="Express, NestJS, NextJS, ReactJS, Cypress, Webpack, Flask, Django, Spring"
                icon={icons.activity}
              >
                Frameworks & Libraries
              </Dropdown.Item>
              <Dropdown.Item
                key="Trends"
                showFullDescription
                description="Avid user of new technologies in market. Experience with Blockchain and web3."
                icon={icons.flash}
              >
                Latest Trends in market
              </Dropdown.Item>
              <Dropdown.Item
                key="Microservices"
                showFullDescription
                description="Experience with Advanced System Design Skill. Worked with SQL and NoSQL databases at scale."
                icon={icons.server}
              >
                Advanced Backend Design
              </Dropdown.Item>
              <Dropdown.Item
                key="Scale"
                showFullDescription
                description="Experience with container technologies (Docker and Kubernetes) to build applications at scale."
                icon={icons.user}
              >
                Scaled 50 million MAU
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Navbar.Link isActive href="/">
            Portfolio
          </Navbar.Link>
          <Navbar.Link href="/about">Quotation</Navbar.Link>
          <Navbar.Link href="/clients">Testimonials</Navbar.Link>
        </Navbar.Content>
      </Navbar>
    
      <Container style={{'maxWidth': '1080px', 'margin': '0 auto'}}>
        <Grid.Container gap={2} justify="center" style={{'maxWidth': '1080px'}}>
          <Grid xs={12} sm={4}>
            <Card1 pressMethod={() => setVisible(true)} />
          </Grid>
          <Grid xs={12} sm={4}>
            <Card2 />
          </Grid>
          <Grid xs={12} sm={4}>
            <Card3 pressMethod={() => setVisible(true)} />
          </Grid>
          <Marquee gradient={false} gradientWidth={'100%'} gradientColor={[221,187,255]}>
            <Image
              width={50}
              src="h1_logo.png"
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
    </React.Fragment>
  );
}