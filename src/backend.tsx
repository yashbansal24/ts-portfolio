import { Container, Grid, Navbar, Collapse, Text, Button, Link,Image, Spacer, Card } from "@nextui-org/react";
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
import Navigation from './components/navigation'
import Marquee from "react-fast-marquee";
import Projects from "./projects";
import { data } from "./system_design"


export default function Backend() {
  const { setVisible, bindings } = useModal();
  const { exercises, practice } = data;
  return (
    <React.Fragment>
    <Navigation />
    <Spacer/>
      {practice.map((item,idx) => {
        return (
          <>
          <Card css={{ 'border': '5px solid orange' , 'margin': '0 auto', 'maxWidth': '1080px', 'wordWrap': 'break-word' }}>
            <Card.Header>
              <Text b>{item.problem}</Text>
            </Card.Header>
            <Card.Divider />
            <Card.Body css={{ py: "$10" }}>
            <Text>
              {item.description}
            </Text>
            <Text h6>
              {item.requirements.map((req,ix) => <Text h6>{req}</Text>)}
            </Text>
            <Text>
              {item.detailed_links.map((lsrc,ix) => <Link key={ix} href={lsrc}>Link {ix+1}</Link>)}
            </Text>
          </Card.Body>
          </Card>
          <Spacer/>
          </>
        );
      })}
      
      {exercises.map((item,idx) => {
        return (
          <>
          <Card css={{ 'border': '5px solid orange', 'margin': '0 auto', 'maxWidth': '1080px', 'wordWrap': 'break-word' }}>
            <Card.Header>
              <Text b>{item.problem}</Text>
            </Card.Header>
            <Card.Divider />
            <Card.Body css={{ py: "$10" }}>
            <Text h6>
              {item.description}
            </Text>
            <Text h6>
              {item.requirements.map((req,ix) => <Text h6>{req}</Text>)}
            </Text>
            <Text h6>
              {item.solution}
            </Text>
            <Text h6>
              {item.detailed_links.map((lsrc,ix) => <Link key={ix} href={lsrc}>Link {ix+1}</Link>)}
            </Text>
          </Card.Body>
          </Card>
          <Spacer/>
          </>
        );
      })}
 
      {/* <div style={{'margin': '0 auto', 'width': '800px', 'height': '600px'}}>
        <iframe  src="https://excalidraw.com/" width={800} height={600}></iframe>
      </div> */}
    </React.Fragment>
  );
}