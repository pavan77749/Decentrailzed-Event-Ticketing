const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Event Ticketing System", function () {
  let eventTicket, eventManager;
  let owner, organizer, buyer;

  beforeEach(async function () {
    [owner, organizer, buyer] = await ethers.getSigners();

    // Deploy EventTicket
    const EventTicket = await ethers.getContractFactory("EventTicket");
    eventTicket = await EventTicket.deploy();
    await eventTicket.deployed();

    // Deploy EventManager
    const EventManager = await ethers.getContractFactory("EventManager");
    eventManager = await EventManager.deploy(eventTicket.address);
    await eventManager.deployed();

    // Authorize EventManager to mint tickets
    await eventTicket.setAuthorizedMinter(eventManager.address, true);
  });

  describe("Event Creation", function () {
    it("Should create an event successfully", async function () {
      const eventName = "Test Concert";
      const eventDescription = "A great concert";
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // Tomorrow
      const ticketPrice = ethers.utils.parseEther("0.1");
      const maxTickets = 100;
      const venue = "Test Venue";

      await eventManager
        .connect(organizer)
        .createEvent(
          eventName,
          eventDescription,
          eventDate,
          ticketPrice,
          maxTickets,
          venue
        );

      const event = await eventManager.getEvent(0);
      expect(event.name).to.equal(eventName);
      expect(event.organizer).to.equal(organizer.address);
      expect(event.maxTickets).to.equal(maxTickets);
    });

    it("Should fail to create event with past date", async function () {
      const pastDate = Math.floor(Date.now() / 1000) - 86400; // Yesterday

      await expect(
        eventManager
          .connect(organizer)
          .createEvent(
            "Past Event",
            "Description",
            pastDate,
            ethers.utils.parseEther("0.1"),
            100,
            "Venue"
          )
      ).to.be.revertedWith("Event date must be in the future");
    });
  });

  describe("Ticket Purchase", function () {
    beforeEach(async function () {
      // Create a test event
      const eventDate = Math.floor(Date.now() / 1000) + 86400;
      await eventManager
        .connect(organizer)
        .createEvent(
          "Test Event",
          "Description",
          eventDate,
          ethers.utils.parseEther("0.1"),
          100,
          "Test Venue"
        );
    });

    it("Should allow buying tickets", async function () {
      const ticketPrice = ethers.utils.parseEther("0.1");
      const quantity = 2;

      await eventManager.connect(buyer).buyTickets(0, quantity, {
        value: ticketPrice.mul(quantity),
      });

      const event = await eventManager.getEvent(0);
      expect(event.ticketsSold).to.equal(quantity);

      const ticketBalance = await eventTicket.balanceOfEvent(buyer.address, 0);
      expect(ticketBalance).to.equal(quantity);
    });

    it("Should fail with insufficient payment", async function () {
      const ticketPrice = ethers.utils.parseEther("0.05"); // Less than required

      await expect(
        eventManager.connect(buyer).buyTickets(0, 1, {
          value: ticketPrice,
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should fail when buying more tickets than available", async function () {
      const ticketPrice = ethers.utils.parseEther("0.1");

      await expect(
        eventManager.connect(buyer).buyTickets(0, 101, {
          // More than maxTickets
          value: ticketPrice.mul(101),
        })
      ).to.be.revertedWith("Not enough tickets available");
    });
  });

  describe("Event Management", function () {
    beforeEach(async function () {
      const eventDate = Math.floor(Date.now() / 1000) + 86400;
      await eventManager
        .connect(organizer)
        .createEvent(
          "Test Event",
          "Description",
          eventDate,
          ethers.utils.parseEther("0.1"),
          100,
          "Test Venue"
        );
    });

    it("Should allow organizer to cancel event", async function () {
      await eventManager.connect(organizer).cancelEvent(0);

      const event = await eventManager.getEvent(0);
      expect(event.isActive).to.be.false;
    });

    it("Should get active events", async function () {
      const activeEvents = await eventManager.getActiveEvents();
      expect(activeEvents.length).to.equal(1);
      expect(activeEvents[0].name).to.equal("Test Event");
    });
  });
});
