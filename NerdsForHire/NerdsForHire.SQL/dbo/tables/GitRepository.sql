CREATE TABLE [dbo].[GitRepository]
(
	[Id] INT IDENTITY (1,1) NOT NULL,
    [Title] NVARCHAR(MAX) NOT NULL, 
    [Location] NVARCHAR(MAX) NOT NULL, 
    [Description] NVARCHAR(MAX) NOT NULL, 
    [Stars] INT NOT NULL,
	PRIMARY KEY CLUSTERED ([Id] ASC)
)
