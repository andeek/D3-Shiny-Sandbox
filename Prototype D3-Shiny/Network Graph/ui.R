reactivePlot <- function(outputId) 
{
  HTML(paste("<div id=\"", outputId, "\" class=\"shiny-graph-output\"><svg /></div>", sep=""))
}

d3Input <- function(inputID, value) {
  div(id=inputID, class=inputID, tag("p",value));
}

shinyUI(pageWithSidebar(
  
  headerPanel("Interactive Graph"),
  
  sidebarPanel(
    uiOutput("choose_dataset"),    
    uiOutput("choose_layout"),
    helpText(HTML("All source available on <a href = \"https://github.com/andeek/Community-Detection/tree/master/Prototype%20D3-Shiny/Network%20Graph\" target=\"_blank\">Github</a>"))
  ),
  
  mainPanel(
    includeHTML("scripts/graph.js"),
    reactivePlot(outputId = "perfplot"),
    d3Input('d3input','')
  )
))
