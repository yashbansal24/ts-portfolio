import { Modal, useModal, Button, Text, Spacer } from "@nextui-org/react";

export default function Experience(props) {
  return (
    <div>
      <Modal
        scroll
        width="600px"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        {...props.bindings}
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Experience
          </Text>
        </Modal.Header>
        <Modal.Body>
        <Text h4 id="modal-description">
            H1 Senior Lead Software Engineer
        </Text>
          <Text h6 id="modal-description">
            - Curated the internal architecture of H1DN short for H1 data network and designed all the workflows. This enables any firm to run and match the data with H1's internal database in near real time using batch and streaming jobs.
            <Spacer/>
            - Leading a technical team of 4 engineers and building a platform for all teams inside H1 to use H1DN as a go to ingestion service for the data. Direct reporting to the CDO and SVP of the company with a size of 800.
            <Spacer/>
            - Building a replication strategy for geographically distributed data. This ensures that data is available at the required time at different places. Handles north of 45 TBs of data for now. Led the development of a distributed database system, improving data reliability and scalability.
            <Spacer/>
            - Single handedly responsible for open sourcing a library which runs batch jobs to transform the data from row based format to another columnar/row based format. This software runs on a distributed cloud platform. The system is horizontally scalable, fault tolerant and processes in a NoSQL db with more than .5 million writes per minute and 1 million reads per second.
            <Spacer/>
            - Founder of the core internal engineering team and open sourcing tools. Involved in organization-wide learning sessions where I have given hands-on tutorials on various topics.
            <Spacer/>
            - Developed a Node Js and NestJs based microservice on Kafka(Pub sub) stream to support normalization and standardization of database records. Produces a burst of more than 10 million events in minutes and consumes them slowly.
            <Spacer/>
            - Released a React app using webpack module federation for visualizing the live job status of H1DN.
            <Spacer/>
            - Automated process of onboarding into the system which took 7 days earlier to a 4 hours process by using a combination of lambda processes and cron jobs.
            <Spacer/>
            - Using AWS via terraform to deploy and containerisation using docker and kubernetes. Working with a combination of SQL and noSQL(DynamoDB, mongoDB) to generate high throughput and low latency systems (&gt; 15 million reads per second).
          </Text>
          <Text h4 id="modal-description">
            PayPal Senior Software Engineer
        </Text>
          <Text h6 id="modal-description">
            - Implemented token based rate limiting system to block malicious calls using redis and remote configs. Currently blocks almost 500k callers daily.
            <Spacer/>
            - Launched 5 different payment experiments which were being used by more than 1 million people every day. A/B experiments were used to ramp control. Application server is based on NodeJS.
            <Spacer/>
            - Single handedly created a RTL friendly experience. Updated all components to be accessible on the mobile web.
            <Spacer/>
            - Single handedly implemented guest estimate buyerview on the new web experience. 100k pageviews per day.
            <Spacer/>
            - Developed all the item flows (creating/editing) on the mobile web(Reactjs) based application. Increase from 30% to 55% in mobile conversion to invoice was noticed with mweb launch.
            <Spacer/>
            - Involved in architectural design of Application with focus on networking, rendering and javascript performance. Splitting the bundles, caching, lazy loading of components and reducing TTFB were part of the primary focus.
            <Spacer/>
            - Implemented HIPAA compliance requirement measures to all different versions of application. This involved creating multiple new REST endpoints and making significant changes in DB. API usage - 1.5+ million per day.
            <Spacer/>
            - Involved in setting up end to end testing using cypress, unit testing with mocha/jest and REST endpoint testing with Postman and newman. Integration of qualtrics feedback mechanism in all the 3 versions of the application.
            <Spacer/>
            - Received award for most patents filed in 2019-20. Involved in mentoring and helping other junior developers in my team. Involved in taking informative sessions and career guidance sessions intermittently in public colleges.
            <Spacer/>
            - Launched various promotions on the invoicing web app contributing to around 20,000 people clicking on those promotions every day.
          </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button auto onPress={() => props.setVisible(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
