create table JobService_Request (
	requestId varchar(255) NOT NULL PRIMARY KEY,
    requestStatus varchar(255),
    createdDate datetime,
    userId int,
    userName varchar(255),
    email varchar(255),
    appid int,
    clientId int,
    tenentId int,
    audience varchar(255),
    issueAtDate datetime,
    imageBase64 blob
);

create table JobService_Job (
	id int PRIMARY KEY AUTO_INCREMENT,
    retryCount int,
    jobId varchar(255),
    lastUpdated datetime,
    requestId varchar(255),
    FOREIGN KEY (requestId) REFERENCES jobservice_request(requestId) 
);

create table JobService_Blob (
	id int PRIMARY KEY AUTO_INCREMENT,
    retryCount int,
    blobId varchar(255),
    lastUpdated datetime,
    requestId varchar(255),
    FOREIGN KEY (requestId) REFERENCES jobservice_request(requestId) 
);