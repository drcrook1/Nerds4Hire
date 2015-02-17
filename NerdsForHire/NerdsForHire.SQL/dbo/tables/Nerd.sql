CREATE TABLE [dbo].[Nerd]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [FirstName] NVARCHAR(50) NOT NULL, 
    [LastName] NVARCHAR(50) NOT NULL, 
    [Specialty] INT NOT NULL, 
    [TagList] NVARCHAR(MAX) NOT NULL, 
    [githubId] NVARCHAR(MAX) NULL, 
    CONSTRAINT [FK_Nerd_Specialty] FOREIGN KEY ([Specialty]) REFERENCES [dbo].[Specialty]([Id])
)
