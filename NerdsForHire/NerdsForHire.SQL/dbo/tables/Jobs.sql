CREATE TABLE [dbo].[Jobs]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [Name] NVARCHAR(50) NOT NULL, 
    [Description] NVARCHAR(MAX) NOT NULL, 
    [Pay] FLOAT NOT NULL, 
    [AssignedNerd] INT NULL, 
    CONSTRAINT [FK_Jobs_Nerd] FOREIGN KEY ([AssignedNerd]) REFERENCES [dbo].[Nerd]([Id])
)
