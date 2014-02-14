##converts housing data to proper gml
#load igraph library, if not installed uncomment following line and run
#install.packages('igraph')
library(igraph)

#change location of csv as needed "Datasets/..etc" based on your current working directory
#if you are unsure of your curred wd, run command getwd()
#when writing the file path, use forward slashes
housing <- read.csv("Datasets/Housing/housing.network.csv", sep=",", header=TRUE)
housing <- subset(housing, Relationship > 0)
                  
#check identical
#want this to return 0 or FALSE
identical(sort(unique(housing$Player1)), sort(unique(housing$Player2)))

graph<-graph.data.frame(housing[,1:2])
E(graph)$weight <- housing[,3]
V(graph)$label <- V(graph)$name

#tell it where to store the graph in the file location. will save relative to your current
#directory. See above for explanation of file path
write.graph(graph, "Datasets/Housing/housing.gml", format="gml")
