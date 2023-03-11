const exercises = [
    {
        "problem": "Design Synchronized Queue Consumers",
        "images": [],
        "description": "Say there exists a very blunt remote queue and whenever the consumers makes a network call to fetch the head of the queue, the queues removes the element and returns it. The queue does not give any protection for concurrent consumers, which means it is possible for two consumers to fetch the front of the queue and the queue returning them the same element. Given this scenario, synchronize the consumers such that a message is consumed by only one consumer.",
        "requirements": [],
        "solution": ["Remote locking and synchronization"],
        "detailed_links": ["https://github.com/yashbansal24/system-design-questions/blob/master/queue-consumers.md"]
    },
    {
        "problem": "Design S3",
        "images": [],
        "description": "Design a scalable blob storage like Amazon's S3. S3 is a distributed file storage facilitating storage of blob data. In simpler terms, it could be described as the folder on the cloud. The various functions to think about while designing something as robust as S3 are: scaling API requests, scaling storage, durability, handling hot storage nodes, cost efficiency, disk utilization, data redundancy, data corruption, and permission management.",
        "requirements": [],
        "solution": ["how raw files are served over HTTP", "Designing complex systems"],
        "detailed_links": ["https://github.com/yashbansal24/system-design-questions/blob/master/s3.md"]
    },
    {
        "problem": "Design a watch Party feature like Prime Video",
        "images": ["simple_state_sync.png"],
        "description": "",
        "requirements": [],
        "solution": ["Using Distributed Locking and Polling"],
        "detailed_links": []
    },
    {
        "problem": "Design a Distributed Cache",
        "images": ["cache_example.png"],
        "description": "cache should support GET, PUT, DEL, and TTL. While designing the cache it is very important to note that the cache should be highly available and scalable. Given that cache is a high throughput and highly concurrent system, scaling up and down the cache should not have a major impact on the data or the performance.",
        "requirements": ["the throughput of the cache should be optimal", "the cache should be lock-free", "every component should be fault tolerant"],
        "solution": ["implementing in-memory cache,", "lock-free implementations,", "consistent hashing"],
        "detailed_links": ["https://github.com/yashbansal24/system-design-questions/blob/master/distributed-cache.md"]
    },
    {
        "problem": "Design a Superfast KV Store",
        "images": [],
        "description": "Design a single-node persistent KV Store that supports GET, PUT and DEL operations and it utilizes hardware (disk, RAM) optimally. The response time for all the 3 operations should be as low as possible and complexity of operations should be O(1). It is okay for this KV store to not support infinite number of keys given it is bound to a single node.",
        "requirements": ["this KV store is not distributed and will run on just a single node"],
        "solution": ["designing storage engine,", "utilizing every ounce of your hardware"],
        "detailed_links": ["https://github.com/yashbansal24/system-design-questions/blob/master/superfast-kv.md"]
    }
]


const practice = [
    {
        "problem": "(OOP) Design a trading platform system",
        "images": [],
        "description": "",
        "requirements": [
            "We will focus on the following set of requirements while designing the online stock brokerage system:",
            "Any user of our system should be able to buy and sell stocks.",
            "Any user can have multiple watchlists containing multiple stock quotes.",
            "Users should be able to place stock trade orders of the following types: 1) market, 2) limit, 3) stop loss and, 4) stop limit.",
            "Users can have multiple <pre>lots</pre> of a stock. This means that if a user has bought a stock multiple times, the system should be able to differentiate between different lots of the same stock.",
            "The system should be able to generate reports for quarterly updates and yearly tax statements.",
            "Users should be able to deposit and withdraw money either via check, wire, or electronic bank transfer.",
            "The system should be able to send notifications whenever trade orders are executed."
        ],
        "solution": [""],
        "detailed_links": ["https://github.com/tssovi/grokking-the-object-oriented-design-interview/blob/master/object-oriented-design-case-studies/design-an-online-stock-brokerage-system.md"]
    },
]

export const data = {
    "exercises": [...exercises],
    "posts": [],
    "practice": [...practice],
    "past_interviews": [],
    "advanced": []
}