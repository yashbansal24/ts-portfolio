import { Navbar, Dropdown, Text } from "@nextui-org/react";
import { AcmeLogo } from "../Acme";
import { icons } from "../icons";


export default function(props) {
    return (
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
          <Navbar.Link href="/firewatch">Firewatch</Navbar.Link>
          <Navbar.Link href="/systemdesign">System Design</Navbar.Link>
          <Navbar.Link href="/contact-us">Pricing</Navbar.Link>
        </Navbar.Content>
      </Navbar>
    );
}